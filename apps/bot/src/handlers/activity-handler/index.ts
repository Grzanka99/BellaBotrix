import { prisma, prismaQueue } from "services/db";
import type { TTwitchIrcContext } from "services/types";

export async function activityHandler({ tags, channel }: TTwitchIrcContext) {
  if (!tags || !tags.username || !tags.userId || !channel) {
    return;
  }

  const { username } = tags;
  prismaQueue.enqueue(async () => {
    const user = await prisma.user.findUnique({
      where: {
        channel,
        userid: `${tags.userId}@${channel}`,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          username: username.toLowerCase().trim(),
          userid: `${tags.userId}@${channel}`,
          channel,
          sentMessages: 1,
          points: 10,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          sentMessages: user.sentMessages + 1,
          points: user.sentMessages ? user.points + 1 : 10,
        },
      });
    }
  });
}
