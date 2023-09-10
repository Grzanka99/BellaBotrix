import { describe, expect, test } from "bun:test";
import { identifyIsBotCommand } from "./identify-message";

describe("identify is command", () => {
  test("should identify as command", async () => {
    const res = await identifyIsBotCommand("!add @WannaCry_TM 100");

    expect(res?.original).toBe("!add @WannaCry_TM 100");
    expect(res?.action).toBe("add");
    expect(res?.actionMessage).toBe("$username get $points points");
  });

  test("should not identify as command", async () => {
    const res = await identifyIsBotCommand("!notacommand @WannaCry_TM 100");

    expect(res).toBe(undefined);
  });
});
