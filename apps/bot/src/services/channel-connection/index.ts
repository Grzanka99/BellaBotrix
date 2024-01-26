import { gc } from "bun";
import { getChatHandler } from "handlers";
import { chatterTimeHandler } from "handlers/activity-handler/chatters-time";
import { setDefaultCommandsForChannel } from "services/commands";
import { getSettings } from "services/settings";
import { ChannelTimer } from "services/timers";
import { TwitchApi } from "services/twitch-api";
import { TwitchIrc } from "services/twitch-irc";
import { TSettings } from "types/schema/settings.schema";
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
  private ownerId: number;
  private isSetup = false;
  private _settings: TSettings | undefined = undefined;

  private chattersInterval: Timer | undefined;
  private automsgInterval: Timer | undefined;
  private settingsInterval: Timer | undefined;

  private automsgTimer: ChannelTimer | undefined;

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
    this._settings = await getSettings(this.ownerId);

    return this._settings;
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
    this.logger.info("Scheduling settings refresh for 10 seconds");
    this.fetchSettings();
    this.settingsInterval = setInterval(() => this.fetchSettings(), 10_000);

    this.irc.addHandler(this.channelName, async ({ self, channel, tags, message }) => {
      if (self) {
        return;
      }

      const handler = await getChatHandler({
        channel,
        tags,
        message,
        settings: this.settings,
        api: this.api,
      });

      for (const h of handler) {
        await h.useHandler({
          channel,
          tags,
          message,
          send: this.send.bind(this),
          settings: this.settings,
        });
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

  public get settings() {
    return this._settings;
  }
}
