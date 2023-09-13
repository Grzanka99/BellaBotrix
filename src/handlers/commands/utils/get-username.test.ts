import { describe, expect, test } from "bun:test";
import { getUsername } from "./get-username";

test("should return correct usernames", () => {
  const [a, b] = getUsername("some message with @Username", "@usernam");

  expect(a).toBe("Username");
  expect(b).toBe("username");
});
