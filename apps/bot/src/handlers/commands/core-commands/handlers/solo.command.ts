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

export const startSoloCoreCommand = new CoreCommand(async (ctx) => {
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

export const soloNopeCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.tags) {
    return undefined;
  }

  const foundSolo = await prismaQueue.enqueue(() =>
    prisma.solo.findFirst({
      where: {
        OR: [{ user1: ctx.tags.username }, { user2: ctx.tags.username }],
        channel: ctx.channel,
        inProgress: true,
        winner: null,
      },
    }),
  );

  if (!foundSolo) {
    return undefined;
  }

  prismaQueue.enqueue(() =>
    prisma.solo.update({
      where: {
        id: foundSolo.id,
      },
      data: {
        inProgress: false,
        winner: null,
      },
    }),
  );

  return interpolate(ctx.parsedCommand.message.base, {
    username: `@${ctx.tags.username}`,
  });
});

export const soloYesCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.tags) {
    return undefined;
  }

  const { base, notEnoughtPoints } = ctx.parsedCommand.message;

  const foundSolo = await prismaQueue.enqueue(() =>
    prisma.solo.findFirst({
      where: {
        user2: ctx.tags.username,
        channel: ctx.channel,
        inProgress: true,
        winner: null,
      },
    }),
  );

  if (!foundSolo) {
    return undefined;
  }

  const user2points = await prismaQueue.enqueue(() =>
    prisma.user.findUnique({
      where: {
        userid: `${ctx.tags.userId}@${ctx.channel}`,
      },
    }),
  );

  if (!user2points) {
    return undefined;
  }

  if (user2points.points < foundSolo.points) {
    return interpolate(notEnoughtPoints || "", {
      username: ctx.tags.displayName,
    });
  }

  const whoWon = Math.floor((Math.random() * 100) % 2);

  const winner = whoWon ? foundSolo.user2 : foundSolo.user1;
  const looser = whoWon ? foundSolo.user1 : foundSolo.user2;

  const res = await prismaQueue.enqueue<string | undefined>(async () => {
    await prisma.solo.update({
      where: {
        id: foundSolo.id,
      },
      data: {
        inProgress: false,
        winner,
      },
    });

    const winnerFromDB = await prisma.user.findFirst({
      where: { username: winner, channel: ctx.channel },
    });

    const looserFromDB = await prisma.user.findFirst({
      where: { username: looser, channel: ctx.channel },
    });

    if (!looserFromDB || !winnerFromDB) {
      return "Something went wrong PoroSad";
    }

    await prisma.user.update({
      where: {
        id: winnerFromDB.id,
      },
      data: {
        points: winnerFromDB.points + foundSolo.points,
      },
    });

    await prisma.user.update({
      where: {
        id: looserFromDB.id,
      },
      data: {
        points: looserFromDB.points - foundSolo.points,
      },
    });

    return undefined;
  });

  if (res) {
    return res;
  }

  return interpolate(base, {
    winner: `@${winner}`,
    looser: `@${looser}`,
    points: foundSolo.points,
  });
});

export const getUserWinrateCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(ctx.message) || [
    ctx.tags.username,
    ctx.tags.username,
  ];

  const solosWithUser = await prismaQueue.enqueue(() =>
    prisma.solo.findMany({
      where: {
        OR: [{ user1: formattedUsername }, { user2: formattedUsername }],
        AND: { inProgress: false, winner: { not: "undecided" }, channel: ctx.channel },
      },
    }),
  );

  const { base, fiftypercent, winrateNegative } = ctx.parsedCommand.message;

  const total = solosWithUser.length;
  const wins = solosWithUser.filter((el) => el.winner === formattedUsername).length;
  const winrate = (wins / total) * 100;
  const formattedWinrate = `${winrate.toFixed(2)}%`;

  if (winrate === 50) {
    return interpolate(fiftypercent || "$winrate", {
      total,
      wins,
      winrate: formattedWinrate,
      username: `@${resUsername}`,
    });
  }

  if (winrate > 50) {
    return interpolate(base, {
      total,
      wins,
      winrate: formattedWinrate,
      username: `@${resUsername}`,
    });
  }

  if (winrate < 50) {
    return interpolate(winrateNegative || "$winrate", {
      total,
      wins,
      winrate: formattedWinrate,
      username: `@${resUsername}`,
    });
  }
});
