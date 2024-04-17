import { EWonLost, TWithCommandHandler } from "handlers/types";
import { prisma, prismaQueue } from "services/db";
import { TTwitchMessageInfo } from "services/types";
import { TOption } from "types";
import { TSettings } from "types/schema/settings.schema";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";
import { getUsername } from "./utils/get-username";

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
  command: TWithCommandHandler,
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
    return command.actionMessage.wtf;
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
    return;
  }

  if (points === "all") {
    numberPoints = user?.points;
  }

  if (user.points < numberPoints) {
    return interpolate(command.actionMessage.notEnoughtPoints || "", {
      username: resUsername,
    });
  }

  const [result, rolled] = getResult(
    user.points + numberPoints,
    settings.points.chancesOffset.value,
  );

  let msg = "";
  let resultPoints = 0;
  switch (result) {
    case EWonLost.Won: {
      resultPoints = numberPoints;
      msg = command.actionMessage.base || "";
      break;
    }
    case EWonLost.SuperWon: {
      resultPoints = numberPoints * 2;
      msg = command.actionMessage.superWon || "";
      break;
    }
    case EWonLost.ExtremeWon: {
      resultPoints = numberPoints * 5;
      msg = command.actionMessage.extremeWon || "";
      break;
    }
    case EWonLost.Lost: {
      msg = command.actionMessage.lose || "";
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
}
