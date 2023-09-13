import { TUseHandler } from "handlers/types";
import { prisma, prismaQueue } from "services/db";

export function createActivityHandler(): TUseHandler {
  return async function ({ tags, channel }) {
    if (!tags.username || !tags["user-id"] || tags["message-type"] !== "chat") {
      return;
    }

    const { username } = tags;
    const user = await prismaQueue.enqueue(() =>
      prisma.user.findUnique({
        where: {
          channel,
          userid: `${tags["user-id"]}@${channel}`,
        },
      }),
    );

    if (!user) {
      prismaQueue.enqueue(() =>
        prisma.user.create({
          data: {
            username: username.toLowerCase().trim(),
            userid: `${tags["user-id"]}@${channel}`,
            channel,
            sentMessages: 1,
            points: 10,
          },
        }),
      );
    } else {
      prismaQueue.enqueue(() =>
        prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            sentMessages: user?.sentMessages || 0 + 1,
            points: user?.sentMessages ? user.points + 1 : 10,
          },
        }),
      );
    }
  };
}
