import { SSettings, type TSettings } from "bellatrix";
import { gc } from "bun";
import { activityHandler } from "handlers/activity-handler";
import { chatterTimeHandler } from "handlers/activity-handler/chatters-time";
import { CommandHandler } from "handlers/commands";
import { triggerWordsHandler } from "handlers/trigger-words";
import { setDefaultCommandsForChannel } from "services/commands";
import { prisma, storage } from "services/db";
import { OllamaAI } from "services/ollama";
import { R6Dle } from "services/r6dle";
import { R6Stats } from "services/r6stats";
import { getSettings } from "services/settings";
import { ChannelTimer } from "services/timers";
import { TwitchApi } from "services/twitch-api";
import type { TwitchIrc } from "services/twitch-irc";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";

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
  private ollamaAI: OllamaAI;

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
    this._api = new TwitchApi(args.channelName, args.authToken);
    this.channelName = args.channelName;
    this.ownerId = args.ownerId;
    this.commandHandler = new CommandHandler(args.channelName);

    // TODO: Move it out of constructor maybe
    this.r6dle = new R6Dle(this.channelName);
    this.r6stats = R6Stats.instance;
    this.ollamaAI = new OllamaAI(this.channelName);

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

  public async setup(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    this.logger.info("Setting up connection");
    await setDefaultCommandsForChannel(this.channelName);

    // NOTE: Chatters
    this.api.startChattersAutorefresh(5000);
    this.chattersInterval = setInterval(async () => {
      await chatterTimeHandler(this.channelName, this.api.chatters);
    }, 30_000);

    // NOTE: Automsg
    this.automsgInterval = setInterval(() => this.automsgChecker(), 300_000);

    // NOTE: Settings
    this.logger.info("Syncing settings with database");
    await this.fetchSettings();

    // NOTE: OllamaAI
    this.ollamaAI.startHistoryCleaner(this.channelName);
    this.ollamaAI.setHistorySize(this.settings?.ollamaAI.keepHistory.value || 5);

    this.irc.addHandler(this.channelName, async (ctx) => {
      if (ctx.self) {
        return;
      }

      switch (ctx.type) {
        case "PRIVMSG": {
          if (!ctx.channel || !ctx.tags || !ctx.message) {
            break;
          }

          // NOTE: Increasing points when user types on chat
          activityHandler(ctx);

          // NOTE: All commands
          if (this.settings) {
            this.commandHandler.handle({
              ...ctx,
              api: this.api,
              settings: this.settings,
              send: this.send.bind(this),
              r6dle: this.r6dle,
              r6stats: this.r6stats,
              ollamaAi: this.ollamaAI,
            });
          }

          // NOTE: "hot words" that trigger some response from bot
          if (this.channelId && this.api && this.settings?.triggerWords.enabled.value) {
            triggerWordsHandler({
              ...ctx,
              channelId: this.channelId,
              send: this.send.bind(this),
            });
          }

          // NOTE: Ollama AI responses
          if (this.settings?.ollamaAI.enabled.value && this.ollamaAI) {
            const shouldRun = this.ollamaAI.shouldRunOnThatMessage(ctx.message);
            if (shouldRun) {
              this.ollamaAI.setHistorySize(this.settings.ollamaAI.keepHistory.value);
              const res = await this.ollamaAI.ask(ctx.message, ctx.tags.username, {
                language: this.settings.ollamaAI.language.value,
                model: this.settings.ollamaAI.model.value,
                defaultPrompt: this.settings.ollamaAI.entryPrompt.value,
              });

              if (res) {
                this.send(`@${ctx.tags.username}, ${res}`);
              }
            }
          }

          break;
        }
        case "JOIN": {
          if (this.settings?.joinMessage.forAllUsers.enabled.value) {
            this.send(
              interpolate(this.settings.joinMessage.forAllUsers.message.value, {
                username: ctx.tags?.displayName || ctx.source?.username || "",
              }),
            );
          }

          if (this.settings?.joinMessage.forSpecificUsers.enabled.value && ctx.source?.username) {
            if (
              this.settings.joinMessage.forSpecificUsers.users.value.includes(
                ctx.tags?.displayName || ctx.source.username,
              )
            ) {
              this.send(
                interpolate(this.settings.joinMessage.forSpecificUsers.message.value, {
                  username: ctx.tags?.displayName || ctx.source.username,
                }),
              );
            }
          }

          break;
        }
      }

      gc(false);
    });

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

    clearInterval(this.settingsInterval);
    this.settingsInterval = undefined;

    this._irc.removeHandler(this.channelName);
    // @ts-ignore-next-line
    this._irc = undefined;
    // @ts-ignore-next-line
    this._api = undefined;

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
