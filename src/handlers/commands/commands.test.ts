import { describe, expect, test } from "bun:test";
import { identifyIsBotCommand } from "./identify-message";

describe("identify is command", () => {
  test("should identify as command", async () => {
    const res = await identifyIsBotCommand("!addpoints @WannaCry_TM 100");

    expect(res?.original).toBe("!addpoints @WannaCry_TM 100");
    expect(res?.action).toBe("addpoints");
    expect(res?.actionMessage).toBe(
      "User $username received $points points, and now has more points! Kappa",
    );
  });

  test("should not identify as command", async () => {
    const res = await identifyIsBotCommand("!notacommand @WannaCry_TM 100");

    expect(res).toBe(undefined);
  });
});
