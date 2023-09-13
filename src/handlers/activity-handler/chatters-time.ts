import { logger } from "@cgsh/utils";
import { prisma } from "services/db";
import { TTwitchApiChatter } from "services/types";
import { AsyncPipe } from "utils/async-pipe";

async function handleSingleChatter(
  chatter: TTwitchApiChatter,
  channel: string,
): Promise<boolean> {
  try {
    if (!chatter.user_id || !chatter.user_name) {
      return false;
    }

    const user = await prisma.user.findUnique({
      where: {
        channel,
        userid: `${chatter.user_id}@${channel}`,
      },
    });

    if (!user) {
      await prisma.user.create({
        data: {
          username: chatter.user_name,
          userid: `${chatter.user_id}@${channel}`,
          channel,
        },
      });
    } else {
      await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          points: user.points + 1,
        },
      });
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
  logger.info(
    `Creating async pipe ${chatters.length} for chatters on channel ${channel}`,
  );
  const pipe = new AsyncPipe(
    handleSingleChatter,
    chatters.map((chatter) => [chatter, channel]),
  );

  pipe.start();
}
