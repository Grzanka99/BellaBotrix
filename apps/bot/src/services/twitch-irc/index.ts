import type { TTwitchIrcContext } from "services/types";
import type { TOption } from "types";
import { logger } from "utils/logger";
import { type MessageEvent, WebSocket } from "ws";
import { parseMessage } from "./parsers";
import { storage } from "services/db";

// NOTE: I think 10 minutes should be safe time
const PING_TRESHHOLD = 600_000;

type TResType = (value: TOption<boolean> | PromiseLike<TOption<boolean>>) => void;

export class TwitchIrc {
  private ws: WebSocket;
  private handlers: Map<string, (ctx: TTwitchIrcContext) => void> = new Map();

  private static _instance: TwitchIrc | undefined;

  private constructor(
    private url: string,
    private nick: string,
    private password: string,
  ) {
    this.ws = new WebSocket(url);
  }

  public static instance(url: string, nick: string, password: string) {
    if (!TwitchIrc._instance) {
      TwitchIrc._instance = new TwitchIrc(url, nick, password);
      return TwitchIrc._instance;
    }

    return TwitchIrc._instance;
  }

  public startPingCheck() {
    setInterval(() => {
      const lastping = Number(storage.get("lastping")?.value);
      const now = Date.now();
      if (now - lastping > PING_TRESHHOLD) {
        this.reconnect();
      }
    }, 60_000);
  }

  public async connect(): Promise<void> {
    await new Promise((resolve: TResType) => {
      try {
        this.ws.addEventListener("open", () => {
          this.onOpen(resolve);
        });
        this.ws.addEventListener("message", (result) => this.onMessage(result));
      } catch (_) {
        resolve(undefined);
      }
    });
  }

  private async reconnect(): Promise<void> {
    logger.warning("[ChatIRC] Triggering reconnect");
    this.ws.removeAllListeners();
    this.ws.close();

    this.ws = new WebSocket(this.url);

    await this.connect();
    this.restoreHandlers();
  }

  private onOpen(res: TResType): void {
    this.ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    this.ws.send(`PASS ${this.password}`);
    this.ws.send(`NICK ${this.nick}`);
    storage.set("lastping", Date.now());
    res(true);
  }

  private handlePingMessage(msg: string): void {
    if (msg.startsWith("PING")) {
      storage.set("lastping", Date.now());
      logger.info(`Received ping: ${msg.substring("PING".length)}`);
      const pong = `PONG${msg.substring("PING".length)}`;
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

  public restoreHandlers() {
    const oldHandlers = new Map();

    for (const [key, handler] of this.handlers) {
      oldHandlers.set(key, handler);
    }

    this.handlers.clear();

    for (const [key, handler] of oldHandlers) {
      this.handlers.delete(key);
      this.addHandler(key, handler);
    }
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
