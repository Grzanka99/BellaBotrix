import { describe, expect, test } from "bun:test";
import type { TTwitchIrcContext } from "services/types";
import { EventBus } from "./event-bus";

const ctx = {} as TTwitchIrcContext;
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

describe("event bus", () => {
  test("handler that throws does not stop later events", async () => {
    const bus = new EventBus();
    const seen: string[] = [];

    bus.on("chat.message", (e) => {
      seen.push(e.channel);
      if (seen.length === 1) {
        throw new Error("boom");
      }
    });

    bus.publish({ type: "chat.message", channel: "#a", ctx });
    bus.publish({ type: "chat.message", channel: "#a", ctx });
    await sleep(10);

    expect(seen).toEqual(["#a", "#a"]);
  });

  test("slow subscriber does not delay another subscriber", async () => {
    const bus = new EventBus(1000);
    const seen: string[] = [];

    bus.on("chat.message", async () => {
      await sleep(200);
      seen.push("slow");
    });
    bus.on("chat.message", () => {
      seen.push("fast");
    });

    bus.publish({ type: "chat.message", channel: "#a", ctx });
    await sleep(20);

    expect(seen).toEqual(["fast"]);
  });

  test("channel filter and abort signal", async () => {
    const bus = new EventBus();
    const controller = new AbortController();
    const seen: string[] = [];

    bus.on("user.joined", (e) => void seen.push(e.channel), {
      channel: "#a",
      signal: controller.signal,
    });

    bus.publish({ type: "user.joined", channel: "#a", ctx });
    bus.publish({ type: "user.joined", channel: "#b", ctx });
    bus.publish({ type: "chat.message", channel: "#a", ctx });
    await sleep(10);

    controller.abort();
    bus.publish({ type: "user.joined", channel: "#a", ctx });
    await sleep(10);

    expect(seen).toEqual(["#a"]);
  });
});
