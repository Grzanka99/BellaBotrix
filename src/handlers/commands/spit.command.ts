import { TWithCommandHandler } from "handlers/types";
import { TwitchApi } from "services/twitch-api";
import { TTwitchMessageInfo } from "services/types";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";

export async function spit(
  command: TWithCommandHandler,
  tags: TTwitchMessageInfo,
  api: TwitchApi,
): Promise<TOption<string>> {
  if (!command.original || !command.actionMessage.base || !tags.userId || !tags.username) {
    return undefined;
  }

  const username1 = `@${tags.username}`;

  const chatters = await api.getChannelChattersList();
  if (!chatters.length) {
    return undefined;
  }

  const chindex = Math.floor(Math.random() * chatters.length);
  const user2 = chatters[chindex];

  if (user2.user_name === tags.username) {
    return interpolate(command.actionMessage.onHimself || command.actionMessage.base, {
      username1,
      username2: `@${user2.user_name}`,
    });
  }

  return interpolate(command.actionMessage.base, {
    username1,
    username2: `@${user2.user_name}`,
  });
}
