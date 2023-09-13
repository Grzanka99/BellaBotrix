import { getChatHandler } from "handlers";
import { getOAuthToken } from "services/twitch-api/api-connector";
import tmi from "tmi.js";
import { chatters } from "./chatters";

const client = new tmi.Client({
  options: { debug: true },
  identity: {
    username: Bun.env.CLIENT_ID,
    password: Bun.env.PASSWORD,
  },
  channels: ["wannacry_tm", "trejekk"],
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

getOAuthToken().then((res) => {
  if (!res) {
    return;
  }

  client.on("join", (channel) => {
    chatters(channel, res);
  });
});
