import type { TwitchIrc } from "services/twitch-irc";
import { logger } from "utils/logger";

const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_MESSAGES = 20;
const RATE_LIMIT_WINDOW_MS = 30_000;

type TWriter = Pick<TwitchIrc, "sendRaw">;

type TChannelLane = {
  waiting: string[];
  sentAt: number[];
  timer: Timer | undefined;
};

// NOTE: makes text safe to put into a single IRC line and cuts it into twitch sized pieces
export function toChatLines(text: string): string[] {
  const clean = text.replace(/[\r\n]+/g, " ").trim();
  if (!clean) {
    return [];
  }

  // NOTE: Array.from splits by code points, so emojis (surrogate pairs) are never cut in half
  const chars = Array.from(clean);
  const lines: string[] = [];
  for (let i = 0; i < chars.length; i += MAX_MESSAGE_LENGTH) {
    lines.push(chars.slice(i, i + MAX_MESSAGE_LENGTH).join(""));
  }

  return lines;
}

export class ChatOutbox {
  private lanes = new Map<string, TChannelLane>();

  constructor(private irc: TWriter) {}

  public say(channel: string, text: string): void {
    const lane = this.getLane(channel);
    lane.waiting.push(...toChatLines(text));

    // NOTE: if timer is pending, rate limit is already hit, timer will flush it
    if (!lane.timer) {
      this.flush(channel, lane);
    }
  }

  private getLane(channel: string): TChannelLane {
    let lane = this.lanes.get(channel);
    if (!lane) {
      lane = { waiting: [], sentAt: [], timer: undefined };
      this.lanes.set(channel, lane);
    }
    return lane;
  }

  private flush(channel: string, lane: TChannelLane): void {
    lane.timer = undefined;

    const now = Date.now();
    lane.sentAt = lane.sentAt.filter((at) => now - at < RATE_LIMIT_WINDOW_MS);

    while (lane.waiting.length > 0 && lane.sentAt.length < RATE_LIMIT_MESSAGES) {
      const line = lane.waiting.shift();
      if (line === undefined) {
        break;
      }

      lane.sentAt.push(now);
      try {
        this.irc.sendRaw(channel, line);
      } catch (e) {
        logger.error(`[ChatOutbox] [${channel}] Failed to send message: ${e}`);
      }
    }

    if (lane.waiting.length > 0) {
      const wait = lane.sentAt[0] + RATE_LIMIT_WINDOW_MS - now;
      lane.timer = setTimeout(() => this.flush(channel, lane), wait);
    }
  }
}
