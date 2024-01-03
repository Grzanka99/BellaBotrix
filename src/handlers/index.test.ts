// @ts-nocheck
import { getChatHandler } from "handlers";
import { describe, test, expect } from "bun:test";

describe.skip("get chat handler", () => {
  test("should return only default handler", async () => {
    const res = await getChatHandler(
      "anychannel",
      { username: "wannacry_tm" },
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
      { username: "wannacry_tm" },
      "!points @wannacry_tm",
      {},
    );

    expect(res.length).toBe(2);
  });
});
