import { AsyncQueue } from "utils/async-queue";
import { logger } from "utils/logger";
import type { TBotEvent, TBotEventOf, TBotEventType } from "./events";

type THandler<T extends TBotEventType> = (event: TBotEventOf<T>) => void | Promise<void>;

type TSubscription = {
  type: TBotEventType;
  channel: string | undefined;
  handler: (event: TBotEvent) => void | Promise<void>;
  // NOTE: one queue per channel, so events run in order per channel
  // but a slow channel never blocks another one
  queues: Map<string, AsyncQueue>;
};

type TOnOptions = {
  channel?: string;
  signal?: AbortSignal;
};

export class EventBus {
  private subscriptions = new Set<TSubscription>();

  constructor(private handlerTimeoutMs = 30_000) {}

  public on<T extends TBotEventType>(type: T, handler: THandler<T>, opts: TOnOptions = {}): void {
    if (opts.signal?.aborted) {
      return;
    }

    const sub: TSubscription = {
      type,
      channel: opts.channel,
      // NOTE: publish() only calls it for events of this type
      handler: (event) => handler(event as TBotEventOf<T>),
      queues: new Map(),
    };

    this.subscriptions.add(sub);
    opts.signal?.addEventListener("abort", () => this.subscriptions.delete(sub), { once: true });
  }

  public publish(event: TBotEvent): void {
    for (const sub of this.subscriptions) {
      if (sub.type !== event.type) {
        continue;
      }

      if (sub.channel && sub.channel !== event.channel) {
        continue;
      }

      let queue = sub.queues.get(event.channel);
      if (!queue) {
        queue = new AsyncQueue();
        sub.queues.set(event.channel, queue);
      }

      void queue.enqueue(() => this.runHandler(sub, event));
    }
  }

  private async runHandler(sub: TSubscription, event: TBotEvent): Promise<void> {
    // NOTE: subscription may have been aborted while this event was waiting in the queue
    if (!this.subscriptions.has(sub)) {
      return;
    }

    let timer: Timer | undefined;
    const timeout = new Promise<"timeout">((resolve) => {
      timer = setTimeout(() => resolve("timeout"), this.handlerTimeoutMs);
    });

    try {
      const handled = Promise.resolve(sub.handler(event)).then(() => "done" as const);
      const result = await Promise.race([handled, timeout]);
      if (result === "timeout") {
        logger.error(
          `[EventBus] [${event.channel}] ${event.type} handler timed out after ${this.handlerTimeoutMs}ms`,
        );
      }
    } catch (e) {
      logger.error(`[EventBus] [${event.channel}] ${event.type} handler failed: ${e}`);
    } finally {
      clearTimeout(timer);
    }
  }
}

export const bus = new EventBus();
