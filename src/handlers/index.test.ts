import { getChatHandler } from "handlers";
import { describe, test, expect } from "bun:test";

describe("get chat handler", () => {
  test("should return only default handler", async () => {
    const res = await getChatHandler(
      "anychannel",
      { username: "wannacry_tm", 'message-type': 'chat' },
      "anyregularmessage",
    );

    expect(res.length).toBe(1);
    expect(res).toMatchObject([
      {
        useHandler: async () => {},
      },
    ]);
  });

  test("shoud return default and command handler", async () => {
    const res = await getChatHandler(
      "anychannel",
      { username: "wannacry_tm", 'message-type': 'chat' },
      "!points @wannacry_tm",
    );

    expect(res.length).toBe(2);
  });
});
