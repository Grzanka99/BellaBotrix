import { prisma, prismaQueue } from "services/db";
import { CoreCommand } from "../core-command";
import { interpolate } from "utils/interpolate-string";
import { getUsername } from "handlers/commands/utils/get-username";
import { logger } from "utils/logger";

export const getTopCoreCommand = new CoreCommand(async (ctx) => {
  const top = await prismaQueue.enqueue(() =>
    prisma.user.findMany({
      take: 10,
      where: { channel: ctx.channel, isBot: false },
      orderBy: { points: "desc" },
    }),
  );

  if (!top) {
    return undefined;
  }

  let msg = "";
  for (let i = 0; i < 10; i++) {
    msg += interpolate(ctx.parsedCommand.message.listItem || "$index. $username has $points, ", {
      index: i + 1,
      username: top[i].username,
      points: top[i].points,
    });
  }

  return interpolate(ctx.parsedCommand.message.base || "", {
    result: msg,
  });
});

export const getUserPointsCoreCommmand = new CoreCommand(async (ctx) => {
  if (!ctx.tags || !ctx.message) {
    return undefined;
  }

  const { base } = ctx.parsedCommand.message;

  const [resUsername, formattedUsername] = getUsername(ctx.message, ctx.tags.username);
  const targetUserId = await ctx.api.getUserId(formattedUsername);

  const user = await prismaQueue.enqueue(() =>
    prisma.user.findFirst({
      where: { userid: `${targetUserId}@${ctx.channel}` },
    }),
  );

  if (!user) {
    return interpolate(base, {
      username: `@${resUsername}`,
      points: 0,
    });
  }

  return interpolate(base, {
    username: `@${resUsername}`,
    points: formattedUsername === ctx.tags.username ? user.points + 1 : user.points,
  });
});

export const addPointsCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message || !ctx.tags || !ctx.channel) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(ctx.message, ctx.tags.username);
  const targetUserId = await ctx.api.getUserId(formattedUsername);
  if (!targetUserId) {
    return undefined;
  }

  const startPosition = ctx.message.indexOf(resUsername) + resUsername.length;
  const points = Number.parseInt(ctx.message.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  await prismaQueue.enqueue(async () => {
    if (!ctx.channel) {
      return undefined;
    }
    const user = await prisma.user.findFirst({
      where: { userid: `${targetUserId}@${ctx.channel}` },
    });

    if (!user) {
      prisma.user.create({
        data: {
          username: formattedUsername,
          userid: `${targetUserId}@${ctx.channel}`,
          points,
          channel: ctx.channel,
        },
      });
      return `${formattedUsername} doesn't exist on this channel, yet`;
    }

    await prisma.user.update({
      where: {
        userid: user.userid,
      },
      data: {
        points: user.points + points,
      },
    });
  });

  return interpolate(ctx.parsedCommand.message.base, {
    username: `@${resUsername}`,
    points,
  });
}, true);

export const removePointsCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message || !ctx.tags) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(ctx.message, ctx.tags.username);

  const targetUserId = await ctx.api.getUserId(formattedUsername);
  if (!targetUserId) {
    return undefined;
  }

  const startPosition = ctx.message.indexOf(resUsername) + resUsername.length;
  const points = Number.parseInt(ctx.message.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  const finalPoints = await prismaQueue.enqueue(async () => {
    const user = await prisma.user.findUnique({
      where: {
        userid: `${targetUserId}@${ctx.channel}`,
      },
    });

    if (!user) {
      return interpolate(ctx.parsedCommand.message.base || "", {
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

  return interpolate(ctx.parsedCommand.message.base || "", {
    username: `@${resUsername}`,
    points: finalPoints,
  });
}, true);

export const givePointsCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message || !ctx.tags) {
    return undefined;
  }

  const { pointsLtZero, base, notEnoughtPoints } = ctx.parsedCommand.message;

  const [resUsername, receiverUsername] = getUsername(ctx.message, ctx.tags.username);
  const giverUsername = ctx.tags.username;

  const startPosition = ctx.message.indexOf(resUsername) + resUsername.length;
  const points = Number.parseInt(ctx.message.substring(startPosition));

  if (Number.isNaN(points)) {
    logger.error("points is NaN");
    return undefined;
  }

  if (points < 0) {
    return interpolate(pointsLtZero || "", {
      giver: giverUsername,
      receiver: receiverUsername,
    });
  }

  const users = await prismaQueue.enqueue(() =>
    prisma.user.findMany({
      where: {
        channel: ctx.channel,
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
    return interpolate(notEnoughtPoints || "", {
      giver: giverUsername,
      receiver: receiverUsername,
    });
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

  return interpolate(base, {
    receiver: `@${receiverUsername}`,
    giver: `@${giverUsername}`,
    points,
  });
});
