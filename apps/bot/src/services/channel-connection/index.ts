import { SSettings, type TSettings } from "bellatrix";
import type { ChatOutbox } from "bus/chat-outbox";
import { bus } from "bus/event-bus";
import { activityHandler } from "handlers/activity-handler";
import { chatterTimeHandler } from "handlers/activity-handler/chatters-time";
import { CommandHandler } from "handlers/commands";
import { triggerWordsHandler } from "handlers/trigger-words";
import { AIConnector } from "services/ai-connectors";
import { AutomodService } from "services/automod";
import { setDefaultCommandsForChannel } from "services/commands";
import { prisma, storage } from "services/db";
import { R6Dle } from "services/r6dle";
import { R6Stats } from "services/r6stats";
import { getSettings } from "services/settings";
import { StreamStatsGatherer } from "services/streamstats";
import { ChannelTimer } from "services/timers";
import { TwitchApi } from "services/twitch-api";
import type { TwitchIrc } from "services/twitch-irc";
import type { TOption } from "types";
import { every } from "utils/every";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";
import type { TTwitchIrcContext } from "../types";

type TArgs = {
  ircClient: TwitchIrc;
  outbox: ChatOutbox;
  channelName: `#${string}`;
  ownerId: number;
  authToken: string;
};

export class ChannelConnection {
  private _api: TwitchApi;
  private _irc: TwitchIrc;
  private outbox: ChatOutbox;
  // NOTE: one per connection, aborting it stops every interval, timer and bus subscription of the channel.
  // A connection is single use, index.ts creates a new one when the channel is enabled again.
  private readonly scope = new AbortController();
  private channelName: string;
  private channelId: number | undefined = undefined;
  private ownerId: number;
  private isSetup = false;

  private automsgTimer: ChannelTimer | undefined;

  private commandHandler: CommandHandler;

  private r6dle: R6Dle;
  private r6stats: R6Stats;
  private aiConnector: AIConnector;
  private streamStatsGatherer: StreamStatsGatherer;
  private automod: AutomodService;

  private settingsKey: string;

  private get logger() {
    return {
      info: (msg: string) => logger.info(`[${this.channelName}] ${msg}`),
      warning: (msg: string) => logger.warning(`[${this.channelName}] ${msg}`),
      error: (msg: string) => logger.error(`[${this.channelName}] ${msg}`),
    };
  }

  constructor(args: TArgs) {
    logger.info(`Creating channel connection for channel: ${args.channelName}`);
    this._irc = args.ircClient;
    this.outbox = args.outbox;
    this._api = new TwitchApi(args.channelName);
    this.channelName = args.channelName;
    this.ownerId = args.ownerId;
    this.commandHandler = new CommandHandler(args.channelName);

    // TODO: Move it out of constructor maybe
    this.r6dle = new R6Dle(this.channelName);
    this.r6stats = R6Stats.instance;
    this.aiConnector = new AIConnector(this.channelName);
    this.streamStatsGatherer = new StreamStatsGatherer(
      this.channelName,
      this._api,
      this.scope.signal,
    );
    this.automod = new AutomodService(this.channelName, this._api, this.streamStatsGatherer);

    this.settingsKey = `${args.channelName}-settings`;

    void prisma.channel
      .findUnique({
        where: { name: args.channelName.replace("#", "") },
      })
      .then((res) => {
        if (res) {
          this.channelId = res?.id;
        }
      });
  }

  private async automsgChecker(): Promise<void> {
    const info = await this.api.getStreamInfo();
    if (!info) {
      this.automsgTimer?.stop();
      this.automsgTimer = undefined;
    } else if (!this.automsgTimer) {
      this.automsgTimer = new ChannelTimer(
        this.channelName,
        (msg) => {
          this.send(msg);
        },
        this.scope.signal,
      );
    }
  }

  private async fetchSettings() {
    this.settings = await getSettings(this.ownerId);
  }

  private set settings(v: TSettings) {
    storage.set(this.settingsKey, v);
  }

  public get settings(): TSettings | undefined {
    const settings = storage.get(this.settingsKey);
    if (!settings) {
      return undefined;
    }
    const parsed = SSettings.safeParse(settings.value);

    if (!parsed.success) {
      return undefined;
    }

    return parsed.data;
  }

  public get isLive(): boolean {
    const res = storage.get<boolean>(`${this.channelName}_is_live`);

    if (!res) {
      return false;
    }

    return res.value;
  }

  // NOTE: settings for a chat message, undefined when the message should be ignored
  private settingsForMessage(ctx: TTwitchIrcContext): TOption<TSettings> {
    if (ctx.self || !ctx.channel || !ctx.tags || !ctx.message || !this.channelId) {
      return undefined;
    }

    const settings = this.settings;
    if (!settings) {
      this.logger.error("Cannot sync user settings");
    }

    return settings;
  }

  private async runAutomod(ctx: TTwitchIrcContext): Promise<void> {
    const settings = this.settingsForMessage(ctx);
    if (!settings?.automod.enabled.value) {
      return;
    }

    await this.automod.handle(settings.automod, ctx);
  }

  private reportStats(ctx: TTwitchIrcContext): void {
    if (!this.settingsForMessage(ctx)) {
      return;
    }

    this.streamStatsGatherer.reportMessage(ctx);
  }

  private async trackActivity(ctx: TTwitchIrcContext): Promise<void> {
    if (!this.settingsForMessage(ctx)) {
      return;
    }

    await activityHandler(ctx);
  }

  private async runCommands(ctx: TTwitchIrcContext): Promise<void> {
    const settings = this.settingsForMessage(ctx);
    if (!settings) {
      return;
    }

    await this.commandHandler.handle({
      ...ctx,
      api: this.api,
      settings,
      send: this.send.bind(this),
      r6dle: this.r6dle,
      r6stats: this.r6stats,
      ollamaAi: this.aiConnector,
    });
  }

  private async runTriggerWords(ctx: TTwitchIrcContext): Promise<void> {
    const settings = this.settingsForMessage(ctx);
    if (!settings?.triggerWords.enabled.value || !this.channelId) {
      return;
    }

    await triggerWordsHandler({
      ...ctx,
      channelId: this.channelId,
      send: this.send.bind(this),
    });
  }

  private async askAI(ctx: TTwitchIrcContext): Promise<void> {
    const settings = this.settingsForMessage(ctx);
    if (!settings?.ollamaAI.enabled.value || !ctx.message || !ctx.tags) {
      return;
    }

    if (!this.aiConnector.shouldRunOnThatMessage(ctx.message)) {
      return;
    }

    const { ollamaAI } = settings;
    this.aiConnector.setHistorySize(ollamaAI.keepHistory.value);
    const res = await this.aiConnector.ask(ctx.message, ctx.tags.username, {
      language: ollamaAI.language.value,
      model: ollamaAI.model.value,
      defaultPrompt: ollamaAI.entryPrompt.value,
    });

    if (res) {
      this.send(`@${ctx.tags.username}, ${res}`);
    }
  }

  private sendJoinMessage(ctx: TTwitchIrcContext): void {
    if (ctx.self) {
      return;
    }

    if (!this.settings) {
      this.logger.error("Cannot sync user settings");
      return;
    }

    const { forAllUsers, forSpecificUsers } = this.settings.joinMessage;
    if (forAllUsers.enabled.value) {
      this.send(
        interpolate(forAllUsers.message.value, {
          username: ctx.tags?.displayName || ctx.source?.username || "",
        }),
      );
    }

    if (
      forSpecificUsers.enabled.value &&
      ctx.source?.username &&
      forSpecificUsers.users.value.includes(ctx.tags?.displayName || ctx.source.username)
    ) {
      this.send(
        interpolate(forSpecificUsers.message.value, {
          username: ctx.tags?.displayName || ctx.source.username,
        }),
      );
    }
  }

  public async setup(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    this.logger.info("Setting up connection");
    await setDefaultCommandsForChannel(this.channelName);

    // NOTE: Setting up api
    await this.api.init();

    const { signal } = this.scope;

    // NOTE: Chatters
    this.api.startChattersAutorefresh(5000, signal);
    const updateChattersTime = async () => {
      if (!this.isLive) {
        return;
      }
      await chatterTimeHandler(this.channelName, this.api.chatters);
    };
    every(30_000, () => void updateChattersTime(), signal);

    // NOTE: Stats gathering;
    await this.streamStatsGatherer.init();

    // NOTE: Automsg
    every(300_000, () => void this.automsgChecker(), signal);

    // NOTE: Settings
    this.logger.info("Syncing settings with database");
    await this.fetchSettings();

    if (!this.settings) {
      this.logger.error("Cannot sync user settings");
      return;
    }

    // NOTE: OllamaAI
    this.aiConnector.startHistoryCleaner(signal);
    this.aiConnector.setHistorySize(this.settings.ollamaAI.keepHistory.value || 5);

    // NOTE: every feature gets its own bus lane, so a slow one never delays the others
    const opts = { channel: this.channelName, signal };
    bus.on("chat.message", (e) => this.runAutomod(e.ctx), opts);
    bus.on("chat.message", (e) => this.reportStats(e.ctx), opts);
    bus.on("chat.message", (e) => this.trackActivity(e.ctx), opts);
    bus.on("chat.message", (e) => this.runCommands(e.ctx), opts);
    bus.on("chat.message", (e) => this.runTriggerWords(e.ctx), opts);
    bus.on("chat.message", (e) => this.askAI(e.ctx), opts);
    bus.on("user.joined", (e) => this.sendJoinMessage(e.ctx), opts);
    this.irc.join(this.channelName);

    this.isSetup = true;
    this.logger.info("Connection set up");
  }

  public setdown(): void {
    this.logger.info("Setting down connection");
    this.scope.abort();
    this.irc.part(this.channelName);
  }

  public send(msg: string): void {
    this.outbox.say(this.channelName, msg);
  }

  public get api(): TwitchApi {
    return this._api;
  }

  public get irc(): TwitchIrc {
    return this._irc;
  }
}
