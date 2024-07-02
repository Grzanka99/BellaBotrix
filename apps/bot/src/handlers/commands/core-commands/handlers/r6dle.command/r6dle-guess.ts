import type { TOption } from "bellatrix";
import { prisma, prismaQueue } from "services/db";
import type { THandleCoreCommandArgs } from "services/types";
import type { TSubCommand } from "types/schema/commands.schema";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";

async function handlePoints(ctx: THandleCoreCommandArgs, gameId: number): Promise<number> {
  if (!ctx.channel) {
    return 0;
  }

  const game = await prismaQueue.enqueue(() =>
    prisma.r6DleGame.findUnique({
      where: { id: gameId },
      select: {
        winner: true,
        channel: true,
        history: true,
      },
    }),
  );

  if (!game || game.winner !== ctx.tags.username) {
    return 0;
  }

  const maxpoints = ctx.settings.r6dle.maxPoints.value;
  const modifier = ctx.settings.r6dle.modifier.value;

  if (maxpoints - modifier * (game.history.length - 1) < 0) {
    return 0;
  }

  const points = maxpoints - modifier * (game.history.length - 1);

  prismaQueue.enqueue(async () => {
    try {
      const currUser = await prisma.user.findFirst({
        where: { userid: `${ctx.tags.userId}@${ctx.channel}` },
      });

      if (!currUser) {
        return;
      }

      await prisma.user.update({
        where: { userid: `${ctx.tags.userId}@${ctx.channel}` },
        data: {
          points: currUser.points + points,
        },
      });
    } catch (_) {
      logger.error("Something went very very wrong in r6dle");
    }
  });

  return points;
}

export async function handleGuessSubcommand(ctx: THandleCoreCommandArgs): Promise<TOption<string>> {
  const res = await ctx.r6dle.guess(ctx.commandContent, ctx.tags.username);
  if (!res) {
    return undefined;
  }
  const { base, wrong, badOperator } = (ctx.subCommand as TSubCommand).message;

  if (res.response.badOperator) {
    return interpolate(badOperator || "bad operator! $badOperator", {
      badOperator: res.response.badOperator,
    });
  }

  if (res.correct) {
    const thisGameId = ctx.r6dle.gameId;
    ctx.r6dle.startNewGame();

    if (!thisGameId) {
      return interpolate(base, {
        operator: res.response.operator,
        username: ctx.tags.username,
        points: 0,
      });
    }

    const points = await handlePoints(ctx, thisGameId);

    return interpolate(base, {
      operator: res.response.operator,
      username: ctx.tags.username,
      points,
    });
  }

  if (res.response.error) {
    return "Something went really really wrong...";
  }

  return interpolate(wrong || "$diff", {
    diff: res.response.diff,
  });
}
