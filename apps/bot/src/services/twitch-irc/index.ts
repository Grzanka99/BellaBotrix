import { TTwitchIrcContext } from "services/types";
import { TOption } from "types";
import { logger } from "utils/logger";
import { MessageEvent, WebSocket } from "ws";
import { parseMessage } from "./parsers";

export class TwitchIrc {
  private ws: WebSocket;
  private nick: string;
  private password: string;
  private handlers: Map<string, (ctx: TTwitchIrcContext) => void> = new Map();

  constructor(url: string, nick: string, password: string) {
    this.nick = nick;
    this.password = password;
    this.ws = new WebSocket(url);
  }

  public async connect(): Promise<TOption<TwitchIrc>> {
    return new Promise((res) => {
      try {
        this.ws.addEventListener("open", () => {
          this.onOpen(res);
        });
        this.ws.addEventListener("message", (res) => this.onMessage(res));
      } catch (_) {
        res(undefined);
      }
    });
  }

  private onOpen(res: {
    (value: TOption<TwitchIrc> | PromiseLike<TOption<TwitchIrc>>): void;
  }): void {
    this.ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    this.ws.send(`PASS ${this.password}`);
    this.ws.send(`NICK ${this.nick}`);
    res(this);
  }

  private handlePingMessage(msg: string): void {
    if (msg.startsWith("PING :")) {
      logger.info(`Received ping: ${msg.substring("PING: ".length)}`);
      const pong = `PONG: ${msg.substring("PING: ".length)}`;
      logger.info(`Sending pong: ${pong}`);
      this.ws.send(pong);
    }
  }

  private onMessage(res: MessageEvent): void {
    if (!res.data || typeof res.data !== "string") {
      return;
    }

    this.handlePingMessage(res.data);

    const ctx = parseMessage(res.data);

    if (!ctx || !ctx.channel) {
      return;
    }

    switch (ctx.type) {
      case "PRIVMSG": {
        logger.message(`[${ctx.channel}] ${ctx.tags?.displayName}: ${ctx.message}`);
        const handler = this.handlers.get(ctx.channel);

        if (!handler) {
          return;
        }

        handler(ctx);
        break;
      }
      case "JOIN": {
        logger.message(`[${ctx.channel}] [JOIN]: ${ctx.source?.username}`);
        const handler = this.handlers.get(ctx.channel);

        if (!handler) {
          return;
        }

        handler(ctx);
        break;
      }
    }
  }

  public addHandler(channel: string, handler: (ctx: TTwitchIrcContext) => void) {
    logger.info(`Joining room: ${channel}`);
    if (this.handlers.has(channel)) {
      this.handlers.delete(channel);
    }

    this.ws.send(`JOIN ${channel}`);
    this.handlers.set(channel, handler);
    logger.info(`Joined room: ${channel}`);
  }

  public removeHandler(channel: string) {
    logger.info(`Parting room: ${channel}`);
    this.handlers.delete(channel);
    this.ws.send(`PART ${channel}`);
    logger.info(`Parted room: ${channel}`);
  }

  public send(channel: string, message: string): void {
    const chunkSize = 500;
    if (message.length > chunkSize) {
      let currentChunk = "";
      for (let i = 0; i < message.length; i += chunkSize) {
        currentChunk = message.slice(i, i + chunkSize);
        this.ws.send(`PRIVMSG ${channel} :${currentChunk}`);
      }
    } else {
      this.ws.send(`PRIVMSG ${channel} :${message}`);
    }
  }
}
