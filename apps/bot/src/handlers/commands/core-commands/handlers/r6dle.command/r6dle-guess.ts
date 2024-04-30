import type { TOption } from "bellatrix";
import type { THandleCoreCommandArgs } from "services/types";
import type { TSubCommand } from "types/schema/commands.schema";
import { interpolate } from "utils/interpolate-string";

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
    await ctx.r6dle.startNewGame();
    return interpolate(base, { operator: res.response.operator, username: ctx.tags.username });
  }

  return interpolate(wrong || "$diff", {
    diff: res.response.diff,
  });
}
