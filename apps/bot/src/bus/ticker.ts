import { logger } from "utils/logger";
import { bus } from "./event-bus";

// NOTE: the only repeating timer in the whole bot. It publishes a "tick" every TICK_MS,
// features say "run me every N ms" with onEvery() instead of their own setInterval,
// so every schedule is only as precise as the tick (5 s).

export const TICK_MS = 5_000;

let started = false;

export function startTicker(): void {
  if (started) {
    return;
  }

  started = true;
  setInterval(() => bus.publish({ type: "tick", channel: "global", now: Date.now() }), TICK_MS);
}

// NOTE: keeps an anchored deadline instead of "ms since last run", so setInterval jitter can't drift it.
// A tick within half a tick of the deadline counts as due, so it lands on the nearest tick
// (a tick at 4 999 ms still runs a 5 s job). Missed periods are skipped, not caught up.
// While the previous run is still going the tick is ignored and the job runs on the next free tick.
export function onEvery(ms: number, fn: () => void | Promise<void>, signal: AbortSignal): void {
  let nextRun = Date.now() + ms;
  let running = false;

  bus.on(
    "tick",
    (event) => {
      if (event.now < nextRun - TICK_MS / 2 || running) {
        return;
      }

      while (nextRun <= event.now + TICK_MS / 2) {
        nextRun += ms;
      }

      running = true;
      // NOTE: not awaited, so a slow fn never blocks the tick lane
      void (async () => {
        try {
          await fn();
        } catch (e) {
          logger.error(`[Ticker] scheduled task failed: ${e}`);
        } finally {
          running = false;
        }
      })();
    },
    { signal },
  );
}
