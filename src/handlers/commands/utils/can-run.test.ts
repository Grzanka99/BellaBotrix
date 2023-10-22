// @ts-nocheck
import { describe, expect, test } from "bun:test";
import { getCanRun } from "./can-run";

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
        userId: "123345",
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
        userId: "123345",
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
        userId: "123345",
      },
    );

    expect(res).toBe(true);
  });
});
