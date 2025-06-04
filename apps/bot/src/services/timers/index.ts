import { gc } from "bun";
import { prisma } from "services/db";
import { logger } from "utils/logger";
import { SingleTimer, type TTimerSender } from "./single-timer";

export class ChannelTimer {
  private id: number | undefined;
  private channelName: string;
  private syncInterval: Timer | undefined;
  private timers: Record<number, SingleTimer> = {};
  private send: TTimerSender;

  constructor(channel: string, sendFn: TTimerSender) {
    this.channelName = channel.replaceAll("#", "");
    this.send = sendFn;

    prisma.channel.findUnique({ where: { name: this.channelName } }).then((res) => {
      if (!res) {
        logger.error(`Something went wrong while settings timers for channel: ${channel}`);
        return;
      }

      logger.info(`Starting timers for channel: ${channel}`);
      this.id = res.id;
      this.syncTimersWithDB();
      this.startSyncInterval();
    });
  }

  private async syncTimersWithDB(): Promise<void> {
    const timers = await prisma.timers.findMany({
      where: {
        channelId: this.id,
        enabled: true,
        NOT: {
          timeout: 0,
        },
      },
    });

    for (const t of timers) {
      if (this.timers[t.id]) {
        this.timers[t.id].update(t.timeout * 1000, t.message);
      } else {
        this.timers[t.id] = new SingleTimer(t.timeout * 1000, t.message, this.send);
      }
    }

    const mapped = timers.map((e) => e.id);
    for (const id of Object.keys(this.timers)) {
      if (!mapped.includes(Number(id))) {
        this.timers[Number(id)].stop();
        delete this.timers[Number(id)];
      }
    }

    gc(false);
  }

  private startSyncInterval(): void {
    this.syncInterval = setInterval(async () => {
      await this.syncTimersWithDB();
    }, 30_000);
  }

  private stopFetchTimersTimer(): void {
    clearInterval(this.syncInterval);
    this.syncInterval = undefined;
  }

  public start(): void {
    if (this.syncInterval) {
      return;
    }

    this.startSyncInterval();
  }

  public stop(): void {
    this.stopFetchTimersTimer();
    for (const timer of Object.keys(this.timers)) {
      this.timers[Number(timer)].stop();
    }
  }
}
