import { TUseHandler } from "handlers/types";
import { prisma } from "services/db";

export function createActivityHandler(): TUseHandler {
  return async function ({ tags, channel }) {
    if (!tags.username || !tags["user-id"] || tags["message-type"] !== "chat") {
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        channel,
        userid: `${tags["user-id"]}@${channel}`,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          username: tags.username,
          userid: `${tags["user-id"]}@${channel}`,
          channel,
          sentMessages: 1,
          points: 10,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          ...user,
          sentMessages: user.sentMessages + 1,
          points: user.sentMessages ? user.points + 1 : user.points + 10,
        },
      });
    }
  };
}
