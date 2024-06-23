import { getUsername } from "handlers/commands/utils/get-username";
import { prisma, prismaQueue } from "services/db";
import { CoreCommand } from "../core-command";
import { interpolate } from "utils/interpolate-string";

export const messagesCount = new CoreCommand(async (ctx) => {
  if (!ctx.tags || !ctx.message) {
    return undefined;
  }

  const { base } = ctx.parsedCommand.message;

  const [resUsername, formattedUsername] = getUsername("", ctx.tags.username);

  const user = await prismaQueue.enqueue(() =>
    prisma.user.findFirst({
      where: { username: formattedUsername, channel: ctx.channel },
    }),
  );

  if (!user) {
    return interpolate(base, {
      username: `@${resUsername}`,
      count: 0,
    });
  }

  return interpolate(base, {
    username: `@${resUsername}`,
    count: user.sentMessages,
  });
});
