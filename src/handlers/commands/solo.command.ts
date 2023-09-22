import { TCommand } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { ChatUserstate } from "tmi.js";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";

function getUsername(original: string): TOption<[string, string]> {
  const username = original.match(/\@\S+/);

  if (!username) {
    return undefined;
  }

  if (username[0]) {
    return [
      username[0].replace("@", ""),
      username[0].replace("@", "").toLowerCase().trim(),
    ];
  }

  return undefined;
}

export async function startSolo(
  { original, actionMessage }: TCommand,
  channel: string,
  tags: ChatUserstate,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !tags.username || !tags["user-id"]) {
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
        userid: `${tags["user-id"]}@${channel}`,
      },
    }),
  );

  if (!user1points || user1points.points < points) {
    return "You don't have enought poitns for this fight xD";
  }

  prismaQueue.enqueue(() =>
    prisma.solo.create({
      data: {
        user1: username1,
        user2: username2,
        points,
        channel,
        inProgress: true,
      },
    }),
  );

  return interpolate(actionMessage, {
    username1,
    username2,
    points,
  });
}

export async function soloNope(
  { actionMessage }: TCommand,
  channel: string,
  tags: ChatUserstate,
): Promise<TOption<string>> {
  if (!tags["user-id"] || !tags.username || !actionMessage) {
    return undefined;
  }

  const foundSolo = await prismaQueue.enqueue(() =>
    prisma.solo.findFirst({
      where: {
        OR: [
          { user1: tags.username },
          { user2: tags.username},
        ],
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
  tags: ChatUserstate,
): Promise<TOption<string>> {
  if (!tags["user-id"] || !tags.username || !actionMessage) {
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
        userid: `${tags["user-id"]}@${channel}`,
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
