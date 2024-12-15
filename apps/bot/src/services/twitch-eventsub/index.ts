import { logger } from "utils/logger";
import { type MessageEvent, WebSocket } from "ws";
import { SEventSubGeneralMessage, SEventSubMetadata } from "./types";
import { handleEvents } from "./events";
import { storage } from "services/db";
import { EVENTSUB_SESSTION_ID_STORAGE_KEY_0 } from "common";

export class TwitchEventSub {
  private ws: WebSocket;
  private sessionId: string | undefined = undefined;

  private static _instance: TwitchEventSub | undefined;

  private constructor(private url: string) {
    this.ws = new WebSocket(url);
  }

  public static instance(url: string) {
    if (!TwitchEventSub._instance) {
      TwitchEventSub._instance = new TwitchEventSub(url);
      return TwitchEventSub._instance;
    }

    return TwitchEventSub._instance;
  }

  public async connect(): Promise<void> {
    await new Promise((resolve) => {
      try {
        this.ws.addEventListener("open", () => {
          console.log("connection is open");
        });
        this.ws.addEventListener("message", (r) => this.onMessage(r));
      } catch (_) {
        resolve(undefined);
      }
    });
  }

  private handlePingMessage(msg: string): void {
    if (msg.startsWith("PING")) {
      const pong = `PONG${msg.substring("PING".length)}`;
      this.ws.send(pong);
    }
  }

  private keepaliveTimeout = 10;
  private lastevent = 0;

  private keepAliveInterval: Timer | undefined = undefined;

  private async reconnect(url?: string) {
    logger.warning("[EventSub] Triggering reconnect");
    clearInterval(this.keepAliveInterval);
    this.keepAliveInterval = undefined;
    this.ws.removeAllListeners();
    this.ws.close();

    const lurl = url ?? this.url;
    this.ws = new WebSocket(lurl);

    await this.connect();
  }

  private startPingCheck() {
    if (this.keepAliveInterval) {
      return;
    }

    this.keepAliveInterval = setInterval(() => {
      this.lastevent = this.lastevent + 1;
      if (this.lastevent > this.keepaliveTimeout) {
        this.reconnect();
      }
    }, 1000);
  }

  private onMessage(res: MessageEvent): void {
    if (!res.data || typeof res.data !== "string") {
      return;
    }

    this.handlePingMessage(res.data);
    this.lastevent = 0;

    const asjson = SEventSubGeneralMessage.safeParse(JSON.parse(res.data));

    if (!asjson.success) {
      return;
    }

    const data = asjson.data;

    const metadata = SEventSubMetadata.safeParse(data.metadata);
    if (!metadata.success) {
      return;
    }

    switch (metadata.data.message_type) {
      case "session_welcome": {
        if (!("session" in data.payload)) {
          break;
        }

        if (!("keepalive_timeout_seconds" in data.payload.session)) {
          break;
        }

        this.sessionId = data.payload.session.id;
        storage.set(EVENTSUB_SESSTION_ID_STORAGE_KEY_0, data.payload.session.id);

        this.keepaliveTimeout = data.payload.session.keepalive_timeout_seconds;
        this.startPingCheck();
        break;
      }
      case "session_reconnect": {
        if (!("session" in data.payload)) {
          break;
        }

        if (!("reconnect_url" in data.payload.session)) {
          this.reconnect(data.payload.session.reconnect_url);
        } else {
          this.reconnect();
        }

        break;
      }
      case "notification": {
        // @ts-expect-error-next-line
        handleEvents(data.payload);
        break;
      }
    }
  }
}

// const eventsub = TwitchEventSub.instance("wss://eventsub.wss.twitch.tv/ws");
// const eventsub = TwitchEventSub.instance("ws://127.0.0.1:8080/ws");
// await eventsub.connect();
