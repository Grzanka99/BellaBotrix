import { gc } from "bun";
import { onEvery } from "bus/ticker";
import { prisma } from "services/db";
import { logger } from "utils/logger";
import { SingleTimer, type TTimerSender } from "./single-timer";

export class ChannelTimer {
  private id: number | undefined;
  private channelName: string;
  private timers: Record<number, SingleTimer> = {};
  private send: TTimerSender;

  constructor(
    channel: string,
    sendFn: TTimerSender,
    private signal: AbortSignal,
  ) {
    this.channelName = channel.replaceAll("#", "");
    this.send = sendFn;
    signal.addEventListener("abort", () => this.stop(), { once: true });

    void prisma.channel.findUnique({ where: { name: this.channelName } }).then((res) => {
      if (signal.aborted) {
        return;
      }

      if (!res) {
        logger.error(`Something went wrong while settings timers for channel: ${channel}`);
        return;
      }

      logger.info(`Starting timers for channel: ${channel}`);
      this.id = res.id;
      void this.syncTimersWithDB();
      onEvery(30_000, () => this.syncTimersWithDB(), signal);
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

    // NOTE: channel may have been disabled while waiting for DB, don't start timers after stop()
    if (this.signal.aborted) {
      return;
    }

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

  // NOTE: the sync schedule stops with the signal itself
  public stop(): void {
    for (const timer of Object.keys(this.timers)) {
      this.timers[Number(timer)].stop();
    }
  }
}
