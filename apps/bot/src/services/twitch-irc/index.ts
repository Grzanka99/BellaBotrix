import { bus } from "bus/event-bus";
import { onEvery } from "bus/ticker";
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
  private channels = new Set<string>();

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

  // NOTE: runs for the whole process lifetime, the signal is never aborted
  public startPingCheck() {
    onEvery(
      60_000,
      () => {
        const lastping = Number(storage.get("lastping")?.value);
        const now = Date.now();
        if (now - lastping > PING_TRESHHOLD) {
          void this.reconnect();
        }
      },
      new AbortController().signal,
    );
  }

  public async connect(): Promise<void> {
    await new Promise((resolve: TResType) => {
      try {
        this.ws.addEventListener("open", () => {
          this.onOpen(resolve);
        });
        this.ws.addEventListener("message", (result) => this.onMessage(result));
      } catch {
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
    this.rejoinChannels();
  }

  private onOpen(res: TResType): void {
    this.ws.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
    this.ws.send(`PASS ${this.password}`);
    this.ws.send(`NICK ${this.nick}`);
    storage.set("lastping", Date.now());
    res(true);
  }

  private handlePingMessage(line: string): void {
    if (line.startsWith("PING")) {
      storage.set("lastping", Date.now());
      logger.info(`Received ping: ${line.substring("PING".length)}`);
      const pong = `PONG${line.substring("PING".length)}`;
      logger.info(`Sending pong: ${pong}`);
      this.ws.send(pong);
    }
  }

  private onMessage(res: MessageEvent): void {
    if (!res.data || typeof res.data !== "string") {
      return;
    }

    // NOTE: twitch can batch several IRC lines into one frame
    for (const line of res.data.split("\r\n")) {
      if (line) {
        this.handleLine(line);
      }
    }
  }

  private handleLine(line: string): void {
    this.handlePingMessage(line);

    const ctx = parseMessage(line);

    if (!ctx || !ctx.channel) {
      return;
    }

    switch (ctx.type) {
      case "PRIVMSG": {
        logger.message(`[${ctx.channel}] ${ctx.tags?.displayName}: ${ctx.message}`);
        bus.publish({ type: "chat.message", channel: ctx.channel, ctx });
        break;
      }
      case "JOIN": {
        logger.message(`[${ctx.channel}] [JOIN]: ${ctx.source?.username}`);
        bus.publish({ type: "user.joined", channel: ctx.channel, ctx });
        break;
      }
    }
  }

  public join(channel: string): void {
    logger.info(`Joining room: ${channel}`);
    this.ws.send(`JOIN ${channel}`);
    this.channels.add(channel);
    logger.info(`Joined room: ${channel}`);
  }

  public part(channel: string): void {
    logger.info(`Parting room: ${channel}`);
    this.channels.delete(channel);
    this.ws.send(`PART ${channel}`);
    logger.info(`Parted room: ${channel}`);
  }

  private rejoinChannels(): void {
    for (const channel of this.channels) {
      this.join(channel);
    }
  }

  // NOTE: raw single line writer, use ChatOutbox.say instead, it handles splitting and rate limits
  public sendRaw(channel: string, line: string): void {
    this.ws.send(`PRIVMSG ${channel} :${line}`);
  }
}
