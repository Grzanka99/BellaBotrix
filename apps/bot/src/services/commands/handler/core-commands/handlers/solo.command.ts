import type { TOption } from "bellatrix";
import { CoreCommand } from "../core-command";
import { logger } from "utils/logger";
import { prisma, prismaQueue } from "services/db";
import { interpolate } from "utils/interpolate-string";

function getUsername(original: string): TOption<[string, string]> {
  const username = original.match(/\@\S+/);

  if (!username) {
    return undefined;
  }

  if (username[0]) {
    return [username[0].replace("@", ""), username[0].replace("@", "").toLowerCase().trim()];
  }

  return undefined;
}

export const startSoloCoreCommand = new CoreCommand("solo", async (ctx) => {
  if (!ctx.message || !ctx.tags) {
    return undefined;
  }

  const { base, inSolo, notEnoughtPoints } = ctx.parsedCommand.message;

  const username1 = ctx.tags.username;

  const res = getUsername(ctx.message);
  if (!res) {
    return undefined;
  }

  const [unformattedU2, username2] = res;
  const startPosition = ctx.message.indexOf(unformattedU2) + unformattedU2.length;
  const points = Math.abs(Number.parseInt(ctx.message.substring(startPosition)));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  const existingSolo = await prisma.solo.findFirst({
    where: {
      inProgress: true,
      user1: username1,
      user2: username2,
    },
  });

  if (existingSolo) {
    return interpolate(inSolo || "", {
      username1,
      username2,
    });
  }

  const user1points = await prismaQueue.enqueue(() =>
    prisma.user.findUnique({
      where: {
        // @ts-expect-error
        userid: `${ctx.tags.userId}@${ctx.channel}`,
      },
    }),
  );

  if (!user1points || user1points.points < points) {
    return interpolate(notEnoughtPoints || "", {
      username1,
      username2,
    });
  }

  prismaQueue
    .enqueue(() =>
      prisma.solo.create({
        data: {
          user1: username1,
          user2: username2,
          points,
          // @ts-expect-error
          channel: ctx.channel,
          inProgress: true,
        },
      }),
    )
    .then((res) => {
      setTimeout(() => {
        prismaQueue.enqueue(() =>
          prisma.solo.update({
            where: { id: res.id },
            data: { inProgress: false },
          }),
        );
      }, 120 * 1000);
    });

  return interpolate(base, {
    username1,
    username2,
    points,
  });
});
