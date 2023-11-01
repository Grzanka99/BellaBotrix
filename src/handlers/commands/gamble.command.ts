import { EWonLost, TCommand } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { TTwitchMessageInfo } from "services/types";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";
import { getUsername } from "./utils/get-username";
import { TSettings } from "types/schema/settings.schema";

export function getResult(totalPoints: number, offset: number): [EWonLost, number] {
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

export async function gamble(
  command: TCommand,
  channel: string,
  tags: TTwitchMessageInfo,
  settings: TSettings,
): Promise<TOption<string>> {
  if (!command.original || !command.actionMessage || !tags.userId || !tags.username) {
    return undefined;
  }

  const [resUsername, formattedUsername] = getUsername(command.original, tags.username);

  const startPosition = command.original.indexOf("!gamble") + 8;
  const points = command.original.substring(startPosition);
  let numberPoints = parseInt(points);

  if (points !== "all" && Number.isNaN(numberPoints)) {
    logger.error("points is NaN");
    return undefined;
  }

  if (points !== "all" && numberPoints < 0) {
    return "Are you kidding me?! DarkMode";
  }

  const user = await prismaQueue.enqueue(() =>
    prisma.user.findUnique({
      where: {
        userid: `${tags.userId}@${channel}`,
        channel,
      },
    }),
  );

  if (!user) {
    return "You have 0 points Kappa";
  }

  if (points === "all") {
    numberPoints = user?.points;
  }

  if (user.points < numberPoints) {
    return "You are poor, you need more points";
  }

  const [result, rolled] = getResult(user.points + numberPoints, settings.points.chancesOffset.value);

  let resultPoints = 0;
  switch (result) {
    case EWonLost.Won: {
      resultPoints = numberPoints;
      break;
    }
    case EWonLost.SuperWon: {
      resultPoints = numberPoints * 2;
      break;
    }
    case EWonLost.ExtremeWon: {
      resultPoints = numberPoints * 5;
      break;
    }
    case EWonLost.Lost: {
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

  return interpolate(command.actionMessage, {
    username: resUsername,
    rolled,
    result,
    points: numberPoints,
    total: res.points,
  });
}
