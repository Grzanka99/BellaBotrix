import { onEvery } from "bus/ticker";
import { bus } from "bus/event-bus";
import { prisma, storage } from "services/db";
import { CK_CHANNELS_SYNC } from "sqlite-storage";
import { logger } from "utils/logger";

const POLL_INTERVAL = 30_000;

// NOTE: the only place that decides which channels are enabled. Polls the sync key written by apps/sup,
// Postgres LISTEN/NOTIFY from the dashboard could replace this later.
export class ChannelListWatcher {
  private enabled = new Set<string>();
  private lastSync = Date.now();
  private isLoading = false;

  constructor(private signal: AbortSignal) {}

  public start(): void {
    void this.load();
    onEvery(POLL_INTERVAL, () => this.poll(), this.signal);
  }

  private async poll(): Promise<void> {
    // NOTE: checked before lastSync moves, so a change seen during a running load is not lost
    if (this.isLoading) {
      return;
    }

    if (!storage.has(CK_CHANNELS_SYNC)) {
      storage.set(CK_CHANNELS_SYNC, this.lastSync);
    }

    const fromStorage = storage.get<number>(CK_CHANNELS_SYNC);
    if (!fromStorage) {
      storage.set(CK_CHANNELS_SYNC, this.lastSync);
      return;
    }

    if (fromStorage.value === this.lastSync) {
      return;
    }

    logger.info(`Refreshing channel list: ${this.lastSync} -> ${fromStorage.value}`);
    // NOTE: moved only after a successful load, so a failed one is retried on the next poll
    if (await this.load()) {
      this.lastSync = fromStorage.value;
    }
  }

  // NOTE: true when the channel list was loaded and published
  private async load(): Promise<boolean> {
    // NOTE: a slow DB query should not stack up with the next sync
    if (this.isLoading) {
      return false;
    }

    this.isLoading = true;
    try {
      const channels = await prisma.channel.findMany({ where: { enabled: true } });
      if (this.signal.aborted) {
        return false;
      }

      // NOTE: this weird is thing is done, to make sure that version with one # is passed
      const current = new Set(channels.map((ch) => `#${ch.name.replaceAll("#", "")}`));

      // NOTE: published for every enabled channel, not only new ones, so a channel that failed
      // to connect is retried on the next sync. The consumer skips already connected channels.
      for (const channel of current) {
        bus.publish({ type: "channel.changed", channel, enabled: true });
      }

      for (const channel of this.enabled) {
        if (!current.has(channel)) {
          bus.publish({ type: "channel.changed", channel, enabled: false });
        }
      }

      this.enabled = current;
      return true;
    } catch (e) {
      logger.error(`[ChannelListWatcher] load failed: ${e}`);
      return false;
    } finally {
      this.isLoading = false;
    }
  }
}
