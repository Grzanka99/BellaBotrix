import { bus } from "bus/event-bus";
import { SingleTimer } from "./single-timer";
import { describe, expect, mock, test } from "bun:test";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("single timer", () => {
  test("should set correct default values", () => {
    const sender = mock((_msg: string) => {});
    const timer = new SingleTimer(1000, "some msg", sender);

    expect(timer["timeout"]).toBe(1000);
    expect(timer["message"]).toBe("some msg");
    expect(timer["sender"]).toBe(sender);
    timer.stop();
  });

  test("should update timeout and message", () => {
    const timer = new SingleTimer(1000, "some msg", () => {});
    timer.update(2000, "another msg");

    expect(timer["timeout"]).toBe(2000);
    expect(timer["message"]).toBe("another msg");
    timer.stop();
  });

  test("should send on ticks once timeout passed, and not after stop", async () => {
    const sender = mock((_msg: string) => {});
    const timer = new SingleTimer(10_000, "some msg", sender);
    const start = Date.now();

    bus.publish({ type: "tick", channel: "global", now: start + 5_000 });
    bus.publish({ type: "tick", channel: "global", now: start + 10_000 });
    bus.publish({ type: "tick", channel: "global", now: start + 15_000 });
    await sleep(10);
    expect(sender).toHaveBeenCalledTimes(1);

    timer.stop();
    bus.publish({ type: "tick", channel: "global", now: start + 20_000 });
    await sleep(10);
    expect(sender).toHaveBeenCalledTimes(1);
  });
});
