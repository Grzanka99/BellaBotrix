import { prisma } from "services/db";
import { TimersSchema } from "types/schema/timers.schema";
import { logger } from "utils/logger";
import { SingleTimer } from "./single-timer";
import { gc } from "bun";

export class ChannelTimer {
  private id: number | undefined;
  private channelName: string;
  private fetchTimersTimer: Timer | undefined;
  private timers: Record<number, SingleTimer> = {};
  private send: (msg: string) => void;

  constructor(channel: string, sendFn: (msg: string) => void) {
    this.channelName = channel.replaceAll("#", "");
    this.send = sendFn;

    prisma.channel.findUnique({ where: { name: this.channelName } }).then((res) => {
      if (!res) {
        return;
      }

      logger.info(`Starting timers for channel: ${channel}`);
      this.id = res.id;
      this.syncTimersWithDB();
      this.startFetchTimersTimer();
    });
  }

  private async syncTimersWithDB() {
    const timers = await prisma.timers.findMany({
      where: {
        channelId: this.id,
        NOT: {
          timeout: 0,
        },
      },
    });

    const parsed = TimersSchema.safeParse(timers);
    if (!parsed.success) {
      return;
    }

    for (const t of parsed.data) {
      if (this.timers[t.id]) {
        this.timers[t.id].update(t.timeout * 1000, t.message);
      } else {
        this.timers[t.id] = new SingleTimer(t.timeout * 1000, t.message, this.send);
      }
    }

    const mapped = parsed.data.map((e) => e.id);
    for (const id of Object.keys(this.timers)) {
      if (!mapped.includes(Number(id))) {
        this.timers[Number(id)].stop();
        delete this.timers[Number(id)];
      }
    }

    gc(false);
  }

  private startFetchTimersTimer() {
    this.fetchTimersTimer = setInterval(async () => {
      await this.syncTimersWithDB();
    }, 30000);
  }

  private stopFetchTimersTimer() {
    clearInterval(this.fetchTimersTimer);
    this.fetchTimersTimer = undefined;
  }

  public start() {
    if (this.fetchTimersTimer) {
      return;
    }

    this.startFetchTimersTimer();
  }

  public stop() {
    this.stopFetchTimersTimer();
  }
}
