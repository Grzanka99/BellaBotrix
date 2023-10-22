import { TCommand } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { TwitchApi } from "services/twitch-api";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";
import { getUsername } from "./utils/get-username";
import { TTwitchMessageInfo } from "services/types";

export async function getUserPoints(
  { original, actionMessage }: TCommand,
  channel: string,
  sender?: string,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !sender) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(original, sender);

  const user = await prismaQueue.enqueue(() =>
    prisma.user.findFirst({
      where: {
        username: formattedUsername,
        channel,
      },
    }),
  );

  if (!user) {
    return interpolate(actionMessage, {
      username: `@${resUsername}`,
      points: 0,
    });
  }

  const msg = interpolate(actionMessage, {
    username: `@${resUsername}`,
    points: formattedUsername === sender ? user.points + 1 : user.points,
  });

  return msg;
}

export async function addPoints(
  { original, actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
  api: TwitchApi,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !tags.username || !tags.userId) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(original, tags.username);

  const targetUserId = await api.getUserId(formattedUsername);
  if (!targetUserId) {
    return undefined;
  }

  const startPosition = original.indexOf(resUsername) + resUsername.length;
  const points = parseInt(original.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  await prismaQueue.enqueue(async () => {
    const user = await prisma.user.findFirst({
      where: {
        userid: `${targetUserId}@${channel}`,
      },
    });

    if (!user) {
      prisma.user.create({
        data: {
          username: formattedUsername,
          userid: `${targetUserId}@${channel}`,
          points,
          channel,
        },
      });
      return `${formattedUsername} doesn't exist on this channel, yet`;
    } else {
      await prisma.user.update({
        where: {
          userid: user.userid,
        },
        data: {
          points: user.points + points,
        },
      });
    }
  });

  return interpolate(actionMessage, {
    username: `@${resUsername}`,
    points,
  });
}
export async function removePoints(
  { original, actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
  api: TwitchApi,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !tags.username || !tags.userId) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(original, tags.username);

  const targetUserId = await api.getUserId(formattedUsername);
  if (!targetUserId) {
    return undefined;
  }

  const startPosition = original.indexOf(resUsername) + resUsername.length;
  const points = parseInt(original.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  const finalPoints = await prismaQueue.enqueue(async () => {
    const user = await prisma.user.findUnique({
      where: {
        userid: `${targetUserId}@${channel}`,
      },
    });

    if (!user) {
      return interpolate(actionMessage, {
        username: `@${resUsername}`,
        points: 0,
      });
    }

    let finalPoints = user.points - points;
    finalPoints = finalPoints < 0 ? 0 : finalPoints;

    await prisma.user.update({
      where: {
        userid: user.userid,
      },
      data: {
        points: finalPoints,
      },
    });

    return finalPoints;
  });

  return interpolate(actionMessage, {
    username: `@${resUsername}`,
    points: finalPoints,
  });
}

export async function givePoints(
  { original, actionMessage }: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !tags.username || !tags.userId) {
    return undefined;
  }

  const [resUsername, receiverUsername] = getUsername(original, tags.username);
  const giverUsername = tags.username;

  const startPosition = original.indexOf(resUsername) + resUsername.length;
  const points = parseInt(original.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  const users = await prismaQueue.enqueue(() =>
    prisma.user.findMany({
      where: {
        channel,
        OR: [{ username: receiverUsername }, { username: giverUsername }],
      },
    }),
  );

  if (users.length !== 2) {
    logger.warning(`Found ${users.length} users`);
    return undefined;
  }

  const receiver = users.find((u) => u.username.toLowerCase() === receiverUsername.toLowerCase());
  const giver = users.find((u) => u.username.toLowerCase() === giverUsername.toLowerCase());

  if (!receiver || !giver) {
    return undefined;
  }

  if (giver.points < points) {
    return "You are not Polish goverment, you cannot give what you don't have";
  }

  await prismaQueue.enqueue(async () => {
    await prisma.user.update({
      where: { userid: giver.userid },
      data: { points: giver.points - points },
    });

    await prisma.user.update({
      where: { userid: receiver.userid },
      data: { points: receiver.points + points },
    });
  });

  return interpolate(actionMessage, {
    receiver: `@${receiverUsername}`,
    giver: `@${giverUsername}`,
    points,
  });
}
