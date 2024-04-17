import { parseBadges } from "./badges.parser";
import { parseEmotes } from "./emotes.parser";
import { describe, expect, it } from "bun:test";

const MESSAGE = "Hey there @Trejekk, Kappa Kappa Kippa";
const EMOTES = "25:20-24,25-30/30:32-36";
const BADGES = ["subscriber/1", "broadcaster/0", "premium/0", "superperson/1"];

describe("parser", () => {
  it("should parse emotes", () => {
    const emotes = parseEmotes(EMOTES, MESSAGE);

    expect(emotes).toMatchObject([
      ["25", "Kappa", 2],
      ["30", "Kippa", 1],
    ]);
  });

  it("should decode correct badges", () => {
    const badges = parseBadges(BADGES);

    expect(badges).toMatchObject({
      subscriber: true,
      broadcaster: false,
      premium: false,
      superperson: true,
    });
  });
});
