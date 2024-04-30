import { getUsername } from "handlers/commands/utils/get-username";
import { EWonLost } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { logger } from "utils/logger";
import { CoreCommand } from "../core-command";
import { interpolate } from "utils/interpolate-string";

function getResult(totalPoints: number, offset: number): [EWonLost, number] {
  const chances = 50 - (totalPoints % 50) + offset;
  const rand = Math.floor(Math.random() * 100) + 1;

  logger.info(`Chances are ${chances}`);

  if (rand === 1) {
    return [EWonLost.ExtremeWon, rand];
  }

  if (rand < chances / 2) {
    return [EWonLost.SuperWon, rand];
  }

  if (rand < chances) {
    return [EWonLost.Won, rand];
  }

  return [EWonLost.Lost, rand];
}

export const gambleCoreCommand = new CoreCommand(async (ctx) => {
  if (!ctx.message) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(ctx.message, ctx.tags.username);

  const startPosition = ctx.message.indexOf("!gamble") + 8;
  const points = ctx.message.substring(startPosition);
  let numberPoints = Number.parseInt(points);

  if (points !== "all" && Number.isNaN(numberPoints)) {
    logger.error("points is NaN");
    return undefined;
  }

  const { base, wtf, notEnoughtPoints, superWon, extremeWon, lose } = ctx.parsedCommand.message;

  if (points !== "all" && numberPoints < 0) {
    return wtf;
  }

  const user = await prismaQueue.enqueue(() =>
    prisma.user.findUnique({
      where: {
        userid: `${ctx.tags.userId}@${ctx.channel}`,
        channel: ctx.channel,
      },
    }),
  );

  if (!user) {
    return;
  }

  if (points === "all") {
    numberPoints = user?.points;
  }

  if (user.points < numberPoints) {
    return interpolate(notEnoughtPoints || "", {
      username: resUsername,
    });
  }

  const [result, rolled] = getResult(
    user.points + numberPoints,
    ctx.settings.points.chancesOffset.value,
  );

  let msg = "";
  let resultPoints = 0;
  switch (result) {
    case EWonLost.Won: {
      resultPoints = numberPoints;
      msg = base || "";
      break;
    }
    case EWonLost.SuperWon: {
      resultPoints = numberPoints * 2;
      msg = superWon || "";
      break;
    }
    case EWonLost.ExtremeWon: {
      resultPoints = numberPoints * 5;
      msg = extremeWon || "";
      break;
    }
    case EWonLost.Lost: {
      msg = lose || "";
      resultPoints = -numberPoints;
      break;
    }
    default:
      break;
  }

  const res = await prismaQueue.enqueue(() =>
    prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        points: user.points + resultPoints,
      },
    }),
  );

  return interpolate(msg, {
    username: resUsername,
    rolled,
    result,
    points: numberPoints,
    total: res.points,
  });
});
