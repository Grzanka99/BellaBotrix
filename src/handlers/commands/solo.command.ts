import { TCommand } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { TTwitchMessageInfo } from "services/types";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";

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

export async function startSolo(
  { original, actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !tags.username || !tags.userId) {
    return undefined;
  }

  const username1 = tags.username;

  const res = getUsername(original);
  if (!res) {
    return undefined;
  }

  const [unformattedU2, username2] = res;
  const startPosition = original.indexOf(unformattedU2) + unformattedU2.length;
  const points = Math.abs(parseInt(original.substring(startPosition)));

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
    return interpolate(
      "Hey, @$username1, you already in solo with @$username2, if you wan't to cancel, write !nope",
      {
        username1,
        username2,
      },
    );
  }

  const user1points = await prismaQueue.enqueue(() =>
    prisma.user.findUnique({
      where: {
        userid: `${tags.userId}@${channel}`,
      },
    }),
  );

  if (!user1points || user1points.points < points) {
    return "You don't have enought poitns for this fight xD";
  }

  prismaQueue
    .enqueue(() =>
      prisma.solo.create({
        data: {
          user1: username1,
          user2: username2,
          points,
          channel,
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

  return interpolate(actionMessage, {
    username1,
    username2,
    points,
  });
}

export async function soloNope(
  { actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
): Promise<TOption<string>> {
  if (!tags.userId || !tags.username || !actionMessage) {
    return undefined;
  }

  const foundSolo = await prismaQueue.enqueue(() =>
    prisma.solo.findFirst({
      where: {
        OR: [{ user1: tags.username }, { user2: tags.username }],
        channel,
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

  return interpolate(actionMessage, {
    username: `@${tags.username}`,
  });
}

export async function soloYes(
  { actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
): Promise<TOption<string>> {
  if (!tags.userId || !tags.username || !actionMessage) {
    return undefined;
  }

  const foundSolo = await prismaQueue.enqueue(() =>
    prisma.solo.findFirst({
      where: {
        user2: tags.username,
        channel,
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
        userid: `${tags.userId}@${channel}`,
      },
    }),
  );

  if (!user2points) {
    return undefined;
  }

  if (user2points.points < foundSolo.points) {
    return `@${tags.username}, you don't have enought poitns to enter this fight, LUL`;
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
      where: { username: winner, channel: channel },
    });

    const looserFromDB = await prisma.user.findFirst({
      where: { username: looser, channel: channel },
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

  return interpolate(actionMessage, {
    winner: `@${winner}`,
    looser: `@${looser}`,
    points: foundSolo.points,
  });
}

export async function getUserWinrate(
  { original, actionMessage }: TCommand,
  channel: string,
  sender?: string,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !sender) {
    return undefined;
  }

  const [resUsername,formattedUsername] = getUsername(original) || [sender, sender];

  const solosWithUser = await prismaQueue.enqueue(() =>
    prisma.solo.findMany({
      where: {
        OR: [{ user1: formattedUsername }, { user2: formattedUsername }],
        AND: { inProgress: false, winner: { not: "undecided" }, channel },
      },
    }),
  );

  const total = solosWithUser.length;
  const wins = solosWithUser.filter((el) => el.winner === formattedUsername).length;
  const winrate = ((wins / total) * 100).toFixed(2);

  return interpolate(actionMessage, {
    total,
    wins,
    winrate: `${winrate}%`,
    username: `@${resUsername}`,
  });
}
