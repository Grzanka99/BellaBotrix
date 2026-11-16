import { bus } from "bus/event-bus";
import { storage } from "services/db";
import type { TwitchApi } from "services/twitch-api";
import { every } from "utils/every";
import { logger } from "utils/logger";

const POLL_INTERVAL = 60_000;

// NOTE: the only place that decides if a channel is live. Polls Twitch for now,
// this is where Twitch EventSub stream.online / stream.offline would plug in later.
export class StreamWatcher {
  private isLive = false;
  private isPolling = false;

  constructor(
    private channel: string,
    private api: TwitchApi,
    private signal: AbortSignal,
  ) {}

  public start(): void {
    void this.poll();
    every(POLL_INTERVAL, () => void this.poll(), this.signal);
  }

  private async poll(): Promise<void> {
    // NOTE: a slow Twitch API call should not stack up with the next tick
    if (this.isPolling) {
      return;
    }

    this.isPolling = true;
    try {
      const info = await this.api.getStreamInfo();
      if (this.signal.aborted) {
        return;
      }

      const wasLive = this.isLive;
      this.isLive = Boolean(info);
      // NOTE: apps/sup reads this key
      storage.set(`${this.channel}_is_live`, this.isLive);

      if (info && !wasLive) {
        logger.info(`${this.channel} is now live`);
        bus.publish({
          type: "stream.started",
          channel: this.channel,
          startedAt: info.started_at,
          streamerId: info.user_id,
        });
      } else if (!info && wasLive) {
        logger.info(`${this.channel} is now offline`);
        bus.publish({ type: "stream.ended", channel: this.channel });
      }
    } catch (e) {
      logger.error(`[StreamWatcher] [${this.channel}] poll failed: ${e}`);
    } finally {
      this.isPolling = false;
    }
  }
}
