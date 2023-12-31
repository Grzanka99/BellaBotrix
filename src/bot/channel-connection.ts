import { gc } from "bun";
import { getChatHandler } from "handlers";
import { chatterTimeHandler } from "handlers/activity-handler/chatters-time";
import { setDefaultCommandsForChannel } from "services/commands";
import { ChannelTimer } from "services/timers";
import { TwitchApi } from "services/twitch-api";
import { TwitchIrc } from "services/twitch-irc";
import { logger } from "utils/logger";

type TArgs = {
  ircClient: WebSocket;
  channelName: `#${string}`;
  ownerId: number;
  authToken: string;
};

export class ChannelConnection {
  private _api: TwitchApi;
  private _irc: TwitchIrc;
  private channelName: string;
  private isSetup = false;

  private chattersInterval: Timer | undefined;

  private automsgInterval: Timer | undefined;
  private automsgTimer: ChannelTimer | undefined;

  constructor(args: TArgs) {
    logger.info(`Creating channel connection for channel: ${args.channelName}`);
    this._irc = new TwitchIrc(args.ircClient, args.channelName, args.ownerId);
    this._api = new TwitchApi(args.channelName, args.authToken);
    this.channelName = args.channelName;
  }

  private async automsgChecker(): Promise<void> {
    const info = await this.api.getStreamInfo();
    if (!info) {
      this.automsgTimer?.stop();
      this.automsgTimer = undefined;
    } else if (!this.automsgTimer) {
      this.automsgTimer = new ChannelTimer(this.channelName, (msg) => {
        this.irc.send(msg);
      });
    }
  }

  public async setup(): Promise<void> {
    if (this.isSetup) {
      return;
    }

    logger.info(`Setting up connection for channel: ${this.channelName}`);
    await setDefaultCommandsForChannel(this.channelName);

    // NOTE: Chatters
    this.api.startChattersAutorefresh(5000);
    this.chattersInterval = setInterval(async () => {
      await chatterTimeHandler(this.channelName, this.api.chatters);
    }, 30_000);

    // NOTE: Automsg
    this.automsgInterval = setInterval(async () => this.automsgChecker(), 300_000);

    this.irc.onMessage(async ({ channel, tags, message, self }, { settings }) => {
      if (self) {
        return;
      }

      const handler = await getChatHandler({
        channel,
        tags,
        message,
        settings,
        api: this.api,
      });

      for (const h of handler) {
        await h.useHandler({
          channel,
          tags,
          message,
          client: this.irc,
          settings,
        });
      }

      gc(false);
    });

    this.isSetup = true;
    logger.info(`Connection for channel: ${this.channelName} set up`);
  }

  public async setdown(): Promise<void> {
    clearInterval(this.chattersInterval);
    this.chattersInterval = undefined;

    clearInterval(this.automsgInterval);
    this.automsgTimer?.stop();
    this.automsgInterval = undefined;
    this.automsgTimer = undefined;
    this.isSetup = false;

    gc(true);
  }

  public get api(): TwitchApi {
    return this._api;
  }

  public get irc(): TwitchIrc {
    return this._irc;
  }
}
