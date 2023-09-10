import { TUseHandler } from "handlers/types";
import { prisma } from "services/db";

export function createActivityHandler(): TUseHandler {
  return async function ({ tags }) {
    if (!tags.username || tags["message-type"] !== "chat") {
      return;
    }

    const user = await prisma.user.findUnique({
      where: {
        username: tags.username,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          username: tags.username,
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
          points: user.points + 1,
        },
      });
    }
  };
}
