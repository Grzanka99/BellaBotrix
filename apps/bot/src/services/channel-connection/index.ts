import { SSettings, type TSettings } from "bellatrix";
import { gc } from "bun";
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
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";
import { TTwitchIrcContext } from "../types";

type TArgs = {
  ircClient: TwitchIrc;
  channelName: `#${string}`;
  ownerId: number;
  authToken: string;
};

export class ChannelConnection {
  private _api: TwitchApi;
  private _irc: TwitchIrc;
  private channelName: string;
  private channelId: number | undefined = undefined;
  private ownerId: number;
  private isSetup = false;

  private chattersInterval: Timer | undefined;
  private automsgInterval: Timer | undefined;

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
    this._api = TwitchApi.getInstance(args.channelName);
    this.channelName = args.channelName;
    this.ownerId = args.ownerId;
    this.commandHandler = new CommandHandler(args.channelName);

    // TODO: Move it out of constructor maybe
    this.r6dle = new R6Dle(this.channelName);
    this.r6stats = R6Stats.instance;
    this.aiConnector = AIConnector.getInstance(this.channelName);
    this.streamStatsGatherer = StreamStatsGatherer.getInstance(this.channelName);
    this.automod = AutomodService.getInstance(this.channelName);

    this.settingsKey = `${args.channelName}-settings`;

    prisma.channel
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
      this.automsgTimer = new ChannelTimer(this.channelName, (msg) => {
        this.irc.send(this.channelName, msg);
      });
    }
  }

  private async fetchSettings() {
    this.settings = await getSettings(this.ownerId);
    this.settings;
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

  private async ircHandler(ctx: TTwitchIrcContext): Promise<void> {
    if (ctx.self) {
      return;
    }

    if (!this.settings) {
      this.logger.error("Cannot sync user settings");
      throw "Cannot sync user settings";
    }

    switch (ctx.type) {
      case "PRIVMSG": {
        if (!ctx.channel || !ctx.tags || !ctx.message || !this.channelId || !this.api) {
          break;
        }

        if (this.settings.automod.enabled.value) {
          this.automod.handle(this.settings.automod, ctx);
        }

        this.streamStatsGatherer.reportMessage(ctx);
        activityHandler(ctx);

        this.commandHandler.handle({
          ...ctx,
          api: this.api,
          settings: this.settings,
          send: this.send.bind(this),
          r6dle: this.r6dle,
          r6stats: this.r6stats,
          ollamaAi: this.aiConnector,
        });

        const { triggerWords, ollamaAI } = this.settings;

        if (triggerWords.enabled.value) {
          triggerWordsHandler({
            ...ctx,
            channelId: this.channelId,
            send: this.send.bind(this),
          });
        }

        if (ollamaAI.enabled.value && this.aiConnector) {
          const shouldRun = this.aiConnector.shouldRunOnThatMessage(ctx.message);
          if (!shouldRun) {
            break;
          }

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

        break;
      }
      case "JOIN": {
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

        break;
      }
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

    // NOTE: Chatters
    this.api.startChattersAutorefresh(5000);
    this.chattersInterval = setInterval(async () => {
      if (!this.isLive) {
        return;
      }
      await chatterTimeHandler(this.channelName, this.api.chatters);
    }, 30_000);

    // NOTE: Stats gathering;
    await this.streamStatsGatherer.init();

    // NOTE: Automsg
    this.automsgInterval = setInterval(() => this.automsgChecker(), 300_000);

    // NOTE: Settings
    this.logger.info("Syncing settings with database");
    await this.fetchSettings();

    if (!this.settings) {
      logger.error("Cannot sync user settings");
      throw "Cannot sync user settings";
    }

    // NOTE: OllamaAI
    this.aiConnector.startHistoryCleaner(this.channelName);
    this.aiConnector.setHistorySize(this.settings?.ollamaAI.keepHistory.value || 5);

    this.irc.addHandler(this.channelName, this.ircHandler.bind(this));

    this.isSetup = true;
    this.logger.info("Connection set up");
  }

  public async setdown(): Promise<void> {
    this.logger.info("Setting down connection");
    clearInterval(this.chattersInterval);
    this.chattersInterval = undefined;

    clearInterval(this.automsgInterval);
    this.automsgTimer?.stop();
    this.automsgInterval = undefined;
    this.automsgTimer = undefined;
    this.isSetup = false;

    this._irc.removeHandler(this.channelName);
    // @ts-ignore-next-line
    this._irc = undefined;
    // @ts-ignore-next-line
    this._api = undefined;
    // @ts-ignore-next-line
    this.r6dle = undefined;
    // @ts-ignore-next-line
    this.r6stats = undefined;
    // @ts-ignore-next-line
    this.aiConnector = undefined;

    this.streamStatsGatherer.destroy();
    // @ts-ignore-next-line
    this.streamStatsGatherer = undefined;
    // @ts-ignore-next-line
    this.automod = undefined;

    // @ts-ignore-next-line
    this.commandHandler = undefined;

    gc(true);
  }

  public send(msg: string): void {
    this.irc.send(this.channelName, msg);
  }

  public get api(): TwitchApi {
    return this._api;
  }

  public get irc(): TwitchIrc {
    return this._irc;
  }
}
