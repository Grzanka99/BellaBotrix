import { chatterTimeHandler } from "handlers/activity-handler/chatters-time";
import { TwitchApi } from "services/twitch-api";

const channels: string[] = [];

export async function chatters(channelName: string, authToken: string) {
  if (channels.includes(channelName)) {
    return;
  }

  channels.push(channelName);

  const channel = new TwitchApi(channelName, authToken);
  channel.startChattersAutorefresh(5000);

  setInterval(async () => {
    await chatterTimeHandler(channelName, channel.chatters);
  }, 30000);
}
