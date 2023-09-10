import { getChatHandler } from "handlers";
import { getOAuthToken, getTwitchApiUser, getChatters } from "services/api";
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

let auth_token: string | undefined = undefined;

setInterval(async () => {
  if (!auth_token) {
    const newToken = await getOAuthToken();
    auth_token = newToken;
  }

  const channels = client.getChannels();

  const viewers = await Promise.all(
    channels.map(async (ch) => {
      const res = await getChatters(ch.replace("#", ""), auth_token || "");

      return {
        [ch]: res?.data,
      };
    }),
  );

  console.log(viewers);
}, 10 * 1000);
