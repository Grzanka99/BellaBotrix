import { interpolate } from "utils/interpolate-string";
import { CoreCommand } from "../core-command";

export const r6StatsCoreComand = new CoreCommand(async (ctx) => {
  if (!ctx.commandContent) {
    return ctx.parsedCommand.message.noUsername;
  }

  const stats = await ctx.r6stats.getProfile(ctx.commandContent);

  if (!stats) {
    return interpolate(ctx.parsedCommand.message.dontExists, {
      ubisoftname: ctx.commandContent,
    });
  }

  return interpolate(ctx.parsedCommand.message.base, {
    ubisoftname: ctx.commandContent,
    kd: stats.currentSeason.ranked.kdRatio,
    wr: stats.currentSeason.ranked.winPercent,
    matches: stats.currentSeason.ranked.wins + stats.currentSeason.ranked.losses,
    level: stats.level,
    rank: `${stats.currentSeason.ranked.rank.toUpperCase()} (${
      stats.currentSeason.ranked.rankPoints
    } RP)`,
  });
});
