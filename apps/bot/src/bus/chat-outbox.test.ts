import { describe, expect, test } from "bun:test";
import { ChatOutbox, toChatLines } from "./chat-outbox";

describe("chat outbox", () => {
  test("replaces CR/LF with a single space", () => {
    expect(toChatLines("hi\r\n\r\nPRIVMSG #x :pwned\n")).toEqual(["hi PRIVMSG #x :pwned"]);
    expect(toChatLines(" \r\n ")).toEqual([]);
  });

  test("never splits a surrogate pair", () => {
    const lines = toChatLines("a" + "😀".repeat(500));
    expect(lines.length).toBe(2);
    expect(Array.from(lines[0]).length).toBe(500);
    expect(lines[1]).toBe("😀");
  });

  test("sends at most 20 messages at once per channel", () => {
    const sent: string[] = [];
    const outbox = new ChatOutbox({ sendRaw: (_channel, line) => void sent.push(line) });

    for (let i = 0; i < 25; i++) {
      outbox.say("#a", `msg ${i}`);
    }
    outbox.say("#b", "other channel");

    expect(sent.length).toBe(21);
    expect(sent.at(-1)).toBe("other channel");
  });
});
