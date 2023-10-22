import { logger } from "utils/logger";
import { createIrcClient } from "./IrcClient";
import { TOption } from "types";
import { parseMessageInfo } from "./parsers";
import { EEvenType, TTwitchIrcContext } from "services/types";

export class TwitchIrc {
  private ws: WebSocket;
  private _channel: string;
  private _connected = false;

  private get logger() {
    return {
      info: (msg: string) => logger.info(`CH: ${this.channel}: ${msg}`),
      warning: (msg: string) => logger.warning(`CH: ${this.channel}: ${msg}`),
      error: (msg: string) => logger.error(`CH: ${this.channel}: ${msg}`),
    };
  }

  constructor(ws: WebSocket, channel: `#${string}`, onConnect?: (it: TwitchIrc) => void) {
    this.ws = ws;
    this._channel = channel;
    this.ws.send(`JOIN ${channel}`);
    this.logger.info("Connecting");

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
    this.ws.send(`PRIVMSG ${this._channel} :${msg}`);
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

      return {
        type: EEvenType.Message,
        channel: this._channel,
        message,
        isCommand: this.isCommand(message),
        info: parseMessageInfo(messageinfo, message),
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

      handler(newCtx, this);
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
}

const irc = await createIrcClient(
  "ws://irc-ws.chat.twitch.tv:80",
  Bun.env.CLIENT_ID || "",
  Bun.env.PASSWORD || "",
);
if (!irc) {
  logger.error("Error creating irc irc client");
} else {
  // const wannacry_tm = new TwitchIrc(irc, "#wannacry_tm");
  const trejekk = new TwitchIrc(irc, "#wannacry_tm", (it) => {
    it.send("What's up?");
  });

  // wannacry_tm.onMessage((it, ctx) => {
  //   console.log("wc", ctx);
  // });
  //
  // trejekk.onMessage((it, ctx) => {
  //   console.log("tk", ctx);
  // });
}
