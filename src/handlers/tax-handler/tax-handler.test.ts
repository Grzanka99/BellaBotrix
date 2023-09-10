import { describe, expect, test } from "bun:test";
import { identifyIsTaxMessage } from "./identify-message";
import { TChatMessage } from "handlers/types";
import { prepareTaxMessages } from "./tax-user";

const CORRECT_MESSAGE =
  "@its_just_nicpon wygrał przed garażami z @WannaCry_TM i wygrał 33 points FeelsGoodMan";
const CORRECT_AUTHOR = "streamlabs";

describe("tax handler", () => {
  test("message with wrong author should be ignored", () => {
    const res = identifyIsTaxMessage({
      author: "anyone",
      content: CORRECT_MESSAGE,
    });

    expect(res).toBe(undefined);
  });

  test("message with wrong content should be ignore", () => {
    const res = identifyIsTaxMessage({
      author: CORRECT_AUTHOR,
      content: "any not mathcing content",
    });

    expect(res).toBe(undefined);
  });

  test("message should be passed as correct object", () => {
    const res = identifyIsTaxMessage({
      author: CORRECT_AUTHOR,
      content: CORRECT_MESSAGE,
    });

    expect(res).toMatchObject({
      winningUser: "@its_just_nicpon",
      loosingUser: "@WannaCry_TM",
      points: 33,
    });
  });

  test("test bundle of messages", () => {
    const messages: TChatMessage[] = [
      {
        author: "streamlabs",
        content: CORRECT_MESSAGE,
      },
      {
        author: "streamlabs",
        content:
          "@its_just_nicpon wygrał przed garażami z @Trejekk i wygrał 2 points FeelsGoodMan",
      },
      {
        author: "streamlabs",
        content:
          "@WannaCry_TM wygrał przed garażami z @badgirl__95 i wygrał 2 points FeelsGoodMan",
      },
      {
        author: "streamlabs",
        content:
          "@bleasd, @its_just_nicpon chce się bić przed garażami o 5 punktów. Możesz przyjąć wyzwanie !tak lub !nie przez 2 minuty. (każda wygrana ze strimerem wymaga oddania podatku w wysokości 25% wygranej)",
      },
    ];

    const correct = messages.filter(identifyIsTaxMessage);

    expect(correct.length).toBe(3);
  });
});

describe("preparing tax messages", () => {
  test("should have correct messages", () => {
    const messages = prepareTaxMessages({
      points: 100,
      winningUser: "@WannaCry_TM",
      loosingUser: "@whocares",
    });
    
    expect(messages[0]).toBe("!removepoints @WannaCry_TM 25");
    expect(messages[1]).toBe("!addpoints @Trejekk 25");
  });

  test("should handle fraction", () => {
    const messages = prepareTaxMessages({
      points: 25,
      winningUser: "@WannaCry_TM",
      loosingUser: "@whocares",
    });

    expect(messages[0]).toBe("!removepoints @WannaCry_TM 7");
    expect(messages[1]).toBe("!addpoints @Trejekk 7");
  })
});
