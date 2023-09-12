import { getChatHandler } from "handlers";
import { TwitchApi } from "services/twitch-api";
import { getOAuthToken } from "services/twitch-api/api-connector";
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

async function chatters() {
  let auth_token: string | undefined = undefined;
  const channels: Record<string, TwitchApi> = {};

  if (!auth_token) {
    const newToken = await getOAuthToken();
    auth_token = newToken;
  }

  const channelsNames = client.getChannels();

  console.log(channelsNames);
  channelsNames.forEach((ch) => {
    if (channels[ch] || !auth_token) {
      return;
    }

    channels[ch] = new TwitchApi(ch, auth_token);
    channels[ch].startChattersAutorefresh(2000);
  });

  setInterval(() => {

  Object.keys(channels).forEach((ch) => {
    console.log(channels[ch].chatters);
  });
  }, 2000);
}

client.on("connected", () => {
  chatters();
});
