import { logger } from "utils/logger";
import { TOption } from "types";
import { parseMessageInfo } from "./parsers";
import { EEvenType, TTwitchIrcContext } from "services/types";
import { TSettings } from "types/schema/settings.schema";
import { getSettings } from "services/settings";
import { interpolate } from "utils/interpolate-string";

export class TwitchIrc {
  private ws: WebSocket;
  private _channel: string;
  private _connected = false;
  private ownerId: number;
  private _settings: TSettings | undefined = undefined;

  private get logger() {
    return {
      info: (msg: string) => logger.info(`CH: ${this.channel}: ${msg}`),
      warning: (msg: string) => logger.warning(`CH: ${this.channel}: ${msg}`),
      error: (msg: string) => logger.error(`CH: ${this.channel}: ${msg}`),
    };
  }

  private async fetchSettings() {
    this._settings = await getSettings(this.ownerId);

    return this._settings;
  }

  constructor(
    ws: WebSocket,
    channel: `#${string}`,
    ownerId: number,
    onConnect?: (it: TwitchIrc) => void,
  ) {
    this.ws = ws;
    this._channel = channel;
    this.ws.send(`JOIN ${channel}`);
    this.logger.info("Connecting");
    this.ownerId = ownerId;

    this.fetchSettings().then(() => {
      this.logger.info("Scheduling settings refresh for 10 seconds");

      setInterval(async () => {
        await this.fetchSettings();
      }, 10000);
    });
    this.ws.addEventListener("message", (r) => {
      if (r.data.includes(`:bellabotrix!bellabotrix@bellabotrix.tmi.twitch.tv JOIN ${channel}`)) {
        this.logger.info("Connected");
        this._connected = true;
        if (onConnect) {
          onConnect(this);
        }
      }
    });
  }

  public send(msg: string) {
    const chunkSize = 500;
    if (msg.length > chunkSize) {
      let currentChunk = "";
      for (let i = 0; i < msg.length; i += chunkSize) {
        currentChunk = msg.slice(i, i + chunkSize);
        this.ws.send(`PRIVMSG ${this._channel} :${currentChunk}`);
      }
    } else {
      this.ws.send(`PRIVMSG ${this._channel} :${msg}`);
    }
  }

  public say = this.send;

  public parseMessageToCtx(msg: string): TOption<TTwitchIrcContext> {
    const splited = msg.split(" ");

    if (!splited.includes(this._channel)) {
      return;
    }

    if (splited.includes("PRIVMSG")) {
      const messageinfo = splited[0];
      // const _idk = splited[1];
      // const channel = splited[3];
      const message = splited.slice(4, splited.length).join(" ").substring(1).trim();
      const tags = parseMessageInfo(messageinfo, message);

      return {
        type: EEvenType.Message,
        channel: this._channel,
        message,
        isCommand: this.isCommand(message),
        tags,
        // TODO: Better logic;
        self: tags.displayName.toLowerCase() === "bellabotrix",
      };
    } else if (splited.includes("ROOMSTATE")) {
      // return { type: EEvenType.Roomstate };
      //
    }

    return undefined;
  }

  public onMessage(handler: (ctx: TTwitchIrcContext, it: TwitchIrc) => void) {
    this.ws.addEventListener("message", (res) => {
      if (typeof res.data !== "string") {
        return;
      }

      const newCtx = this.parseMessageToCtx(res.data);
      if (!newCtx) {
        return;
      }

      logger.message(`${newCtx.tags.displayName}@${this.channel}: ${newCtx.message}`);

      handler(newCtx, this);
    });
  }

  public onJoin(handler: (username: string, it: TwitchIrc) => void) {
    this.ws.addEventListener("message", (res) => {
      if (typeof res.data !== "string") {
        return;
      }

      const isJoinMessage = res.data.includes(`JOIN ${this.channel}`);

      if (!isJoinMessage) {
        return;
      }

      const username = res.data.substring(1, res.data.indexOf("!"));

      if (this.settings?.joinMessage.forAllUsers.enabled.value) {
        this.say(interpolate(this.settings.joinMessage.forAllUsers.message.value, { username }));
      }

      if (this.settings?.joinMessage.forSpecificUsers.enabled.value) {
        if (this.settings.joinMessage.forSpecificUsers.users.value.includes(username)) {
          this.say(
            interpolate(this.settings.joinMessage.forSpecificUsers.message.value, { username }),
          );
        }
      }

      handler(username, this);
    });
  }

  public isCommand(msg: string): boolean {
    if (msg[0] === "!" && msg[1] !== " ") {
      return true;
    }

    return false;
  }

  public get channel() {
    return this._channel;
  }

  public get connected() {
    return this._connected;
  }

  public get settings() {
    return this._settings;
  }
}
