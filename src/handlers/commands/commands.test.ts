import { describe, expect, test } from "bun:test";
import { identifyIsBotCommand } from "./identify-message";
import { getCanRun } from ".";

describe("identify is command", () => {
  test.skip("should identify as command", async () => {
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

describe("command privilages", () => {
  test("should identify wannacry_tm as moderator", () => {
    const res = getCanRun(
      [
        {
          user_id: "123",
          user_name: "whocares",
          user_login: "whocares",
        },
      ],
      "#wannacry_tm",
      {
        username: "wannacry_tm",
        "user-id": "123345",
      },
    );

    expect(res).toBe(true);
  });

  test("should not identify testuser as moderator", () => {
    const res = getCanRun(
      [
        {
          user_id: "123",
          user_name: "whocares",
          user_login: "whocares",
        },
      ],
      "#wannacry_tm",
      {
        username: "testuser",
        "user-id": "123345",
      },
    );

    expect(res).toBe(false);
  });

  test("should identify testuser as moderator", () => {
    const res = getCanRun(
      [
        {
          user_id: "123345",
          user_name: "testuser",
          user_login: "whocares",
        },
      ],
      "#wannacry_tm",
      {
        username: "testuser",
        "user-id": "123345",
      },
    );

    expect(res).toBe(true);
  });
});
