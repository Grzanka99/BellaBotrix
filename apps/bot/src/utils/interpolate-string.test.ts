import { interpolate } from "./interpolate-string";
import { describe, expect, test } from "bun:test";

describe("interpolate string", () => {
  test("should replace $name with TestName", () => {
    const res = interpolate("$name", {
      name: "TestName",
    });

    expect(res).toBe("TestName");
  });

  test("should replace both placeholders", () => {
    const res = interpolate("some $user has some $points", {
      user: "@WannaCry_TM",
      points: 33,
    });

    expect(res).toBe("some @WannaCry_TM has some 33");
  });
});
