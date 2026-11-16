import { describe, expect, test } from "bun:test";
import { bus } from "./event-bus";
import { onEvery } from "./ticker";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const tick = (now: number) => bus.publish({ type: "tick", channel: "global", now });

describe("onEvery", () => {
  test("runs only after ms has passed since the last run", async () => {
    const abort = new AbortController();
    const start = Date.now();
    let runs = 0;
    onEvery(10_000, () => void runs++, abort.signal);

    tick(start + 5_000);
    tick(start + 10_000);
    tick(start + 15_000);
    tick(start + 20_000);
    await sleep(10);
    abort.abort();

    expect(runs).toBe(2);
  });

  test("runs on every jittered tick when ms equals the tick", async () => {
    const abort = new AbortController();
    const start = Date.now();
    let runs = 0;
    onEvery(5_000, () => void runs++, abort.signal);

    tick(start + 4_999);
    tick(start + 10_001);
    tick(start + 14_998);
    tick(start + 20_003);
    await sleep(10);
    abort.abort();

    expect(runs).toBe(4);
  });

  test("skips a tick while the previous async run is still in progress", async () => {
    const abort = new AbortController();
    const start = Date.now();
    let runs = 0;
    onEvery(
      1_000,
      async () => {
        runs++;
        await sleep(50);
      },
      abort.signal,
    );

    tick(start + 1_000);
    tick(start + 2_000);
    await sleep(10);
    expect(runs).toBe(1);

    await sleep(60);
    tick(start + 3_000);
    await sleep(10);
    abort.abort();

    expect(runs).toBe(2);
  });
});
