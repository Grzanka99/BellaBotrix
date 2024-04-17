import { SingleTimer } from "./single-timer";
// @ts-nocheck
import { describe, expect, mock, test } from "bun:test";

const sender = mock((_: string) => {
  return;
});

describe("single timer", () => {
  test("should set correct default values", () => {
    const timer = new SingleTimer(1000, "some msg", sender);

    expect(timer.timeout).toBe(1000);
    expect(timer.message).toBe("some msg");
    expect(timer.sender).toBe(sender);
    expect(timer.timer).not.toBe(undefined);
  });

  test("should clear timer", () => {
    const timer = new SingleTimer(1000, "some msg", sender);
    timer.stop();

    expect(timer.timer).toBe(undefined);
  });

  test("should update timeout and message", () => {
    const timer = new SingleTimer(1000, "some msg", sender);
    timer.update(2000, "another msg");

    expect(timer.timeout).toBe(2000);
    expect(timer.message).toBe("another msg");
  });

  test("should call sender", () => {
    const timer = new SingleTimer(20, "some msg", sender);
    setTimeout(() => {
      timer.stop();
      expect(sender).toHaveBeenCalledTimes(4);
    }, 100);
  });
});
