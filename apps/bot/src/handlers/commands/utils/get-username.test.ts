import { getUsername } from "./get-username";
import { describe, expect, test } from "bun:test";

test("should return correct usernames", () => {
  const [a, b] = getUsername("some message with @Username", "@usernam");

  expect(a).toBe("Username");
  expect(b).toBe("username");
});
