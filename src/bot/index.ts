import { getChatHandler } from "handlers";
import tmi from "tmi.js";

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: Bun.env.CLIENT_ID,
    password: Bun.env.PASSWORD,
  },
  channels: ["wannacry_tm"],
});

client.connect();

client.on("message", async (channel, tags, message, self) => {
  // Ignore echoed messages.
  if (self) {
    return;
  }

  const handler = await getChatHandler(channel, tags, message);

  handler.forEach((handler) => {
    handler.useHandler({
      channel,
      tags,
      message,
      client,
    });
  });
});
