import { prisma, prismaQueue } from "services/db";
import type { TTwitchApiChatter } from "services/types";
import { logger } from "utils/logger";

async function handleSingleChatter(chatter: TTwitchApiChatter, channel: string): Promise<boolean> {
  try {
    if (!chatter.user_id || !chatter.user_name) {
      return false;
    }

    const user = await prismaQueue.enqueue(() =>
      prisma.user.findUnique({
        where: {
          channel,
          userid: `${chatter.user_id}@${channel}`,
        },
      }),
    );

    if (!user) {
      await prismaQueue.enqueue(() =>
        prisma.user.create({
          data: {
            username: chatter.user_name.toLowerCase().trim(),
            userid: `${chatter.user_id}@${channel}`,
            channel,
          },
        }),
      );
    } else {
      await prismaQueue.enqueue(() =>
        prisma.user.update({
          where: {
            id: user.id,
          },
          data: {
            points: user.points + 1,
          },
        }),
      );
    }

    return true;
  } catch (e) {
    logger.error(`Failed to update user ${chatter.user_name}`);
    return false;
  }
}

export async function chatterTimeHandler(
  channel: string,
  chatters: TTwitchApiChatter[],
): Promise<void> {
  for (const chatter of chatters) {
    handleSingleChatter(chatter, channel);
  }
}
