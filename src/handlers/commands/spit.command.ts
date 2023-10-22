import { TCommand } from "handlers/types";
import { TwitchApi } from "services/twitch-api";
import { TTwitchMessageInfo } from "services/types";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";

export async function spit(
  command: TCommand,
  tags: TTwitchMessageInfo,
  api: TwitchApi,
): Promise<TOption<string>> {
  if (!command.original || !command.actionMessage || !tags.userId|| !tags.username) {
    return undefined;
  }

  const username1 = `@${tags.username}`;

  const chatters = await api.getChannelChattersList();
  if (!chatters.length) {
    return undefined;
  }

  const chindex = Math.floor(Math.random() * chatters.length);
  const user2 = chatters[chindex];

  return interpolate(command.actionMessage, {
    username1,
    username2: `@${user2.user_name}`,
  });
}
