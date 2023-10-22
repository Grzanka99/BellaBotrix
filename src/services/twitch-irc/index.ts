import { logger } from "utils/logger";
import { createIrcClient } from "./IrcClient";
import { TOption } from "types";
import { parseMessageInfo } from "./parsers";
import { EEvenType, TTwitchIrcContext } from "services/types";

export class TwitchIrc {
  private ws: WebSocket;
  private channel: string;

  constructor(ws: WebSocket, channel: `#${string}`) {
    this.ws = ws;
    this.channel = channel;
    this.ws.send(`JOIN ${channel}`);
  }

  public send(msg: string) {
    this.ws.send(`PRIVMSG ${this.channel} :${msg}`);
  }

  public say = this.send;

  public parseMessageToCtx(msg: string): TOption<TTwitchIrcContext> {
    const splited = msg.split(" ");

    if (!splited.includes(this.channel)) {
      return;
    }

    if (splited.includes("PRIVMSG")) {
      const messageinfo = splited[0];
      // const _idk = splited[1];
      // const channel = splited[3];
      const message = splited.slice(4, splited.length).join(" ").substring(1).trim();

      return {
        type: EEvenType.Message,
        channel: this.channel,
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

  public onMessage(handler: (it: TwitchIrc, ctx: TTwitchIrcContext) => void) {
    this.ws.addEventListener("message", (res) => {
      if (typeof res.data !== "string") {
        return;
      }

      const newCtx = this.parseMessageToCtx(res.data);
      if (!newCtx) {
        return;
      }

      handler(this, newCtx);
    });
  }

  public isCommand(msg: string): boolean {
    if (msg[0] === "!" && msg[1] !== " ") {
      return true;
    }

    return false;
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
  const wannacry_tm = new TwitchIrc(irc, "#wannacry_tm");
  const trejekk = new TwitchIrc(irc, "#trejekk");

  wannacry_tm.onMessage((it, ctx) => {
    console.log("wc", ctx);
  });

  trejekk.onMessage((it, ctx) => {
    console.log("tk", ctx);
  });
}
