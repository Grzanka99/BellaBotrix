import { interpolate } from "utils/interpolate-string";
import { CoreCommand } from "../core-command";

export const spitCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message || !ctx.tags) {
    return undefined;
  }

  const { base, onHimself } = ctx.parsedCommand.message;

  const username1 = `@${ctx.tags.username}`;

  const chatters = await ctx.api.getChannelChattersList();
  if (!chatters.length) {
    return undefined;
  }

  const chindex = Math.floor(Math.random() * chatters.length);
  const user2 = chatters[chindex];

  if (user2.user_name.toLowerCase() === ctx.tags.username.toLowerCase()) {
    return interpolate(onHimself || base, {
      username1,
      username2: `@${user2.user_name}`,
    });
  }

  return interpolate(base, {
    username1,
    username2: `@${user2.user_name}`,
  });
});
