import { bus } from "bus/event-bus";
import { TICK_MS } from "bus/ticker";

export type TTimerSender = (msg: string) => void;

export class SingleTimer {
  private timeout: number;
  private message: string;
  private sender: TTimerSender;

  private nextRun: number;
  private abort = new AbortController();

  constructor(initTimeout: number, initMsg: string, sender: TTimerSender) {
    this.timeout = initTimeout;
    this.message = initMsg;
    this.sender = sender;
    this.nextRun = Date.now() + initTimeout;

    // NOTE: subscribes to tick directly instead of onEvery, because update() can change the timeout
    bus.on(
      "tick",
      (event) => {
        // NOTE: same deadline rule as onEvery: due within half a tick, missed periods skipped
        if (event.now < this.nextRun - TICK_MS / 2) {
          return;
        }

        while (this.nextRun <= event.now + TICK_MS / 2) {
          this.nextRun += this.timeout;
        }

        this.sender(this.message);
      },
      { signal: this.abort.signal },
    );
  }

  public stop(): void {
    this.abort.abort();
  }

  public update(timeout: number, msg: string): void {
    // NOTE: only a changed timeout restarts the countdown, update() is called on every timers refresh
    if (timeout !== this.timeout) {
      this.nextRun = Date.now() + timeout;
    }
    this.timeout = timeout;
    this.message = msg;
  }
}
