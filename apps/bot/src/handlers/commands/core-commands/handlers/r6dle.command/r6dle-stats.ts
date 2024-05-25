import { prisma, prismaQueue } from "services/db";
import type { THandleCoreCommandArgs } from "services/types";
import type { TOption } from "types";

export async function handleStatsSubcommand(ctx: THandleCoreCommandArgs): Promise<TOption<string>> {
  const allGames = await prismaQueue.enqueue(() =>
    prisma.r6DleGame.findMany({ where: { channel: ctx.channel } }),
  );

  const accumulated: Map<string, number> = new Map();

  for (const game of allGames) {
    if (!game.winner) {
      continue;
    }

    const found = accumulated.get(game.winner);
    accumulated.set(game.winner, found ? found + 1 : 1);
  }

  const asArray = Array.from(accumulated);
  asArray.sort((a, b) => b[1] - a[1]);

  let res = "TOP 10: ";

  for (const player of asArray) {
    res += `${player[0]}: ${player[1]} wins, `;
  }

  return res;
}
