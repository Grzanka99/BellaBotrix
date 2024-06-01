import { z } from "zod";

export const SR6ProfileStats = z.object({
  level: z.number(),
  currentSeason: z.object({
    ranked: z.object({
      abandons: z.number(),
      championNumber: z.number(),
      deaths: z.number(),
      kdRatio: z.string(),
      kills: z.number(),
      losses: z.number(),
      maxRank: z.string(),
      maxRankPoints: z.number(),
      nextRank: z.string(),
      nextRankByMaxRank: z.string(),
      nextRankRankPoints: z.number(),
      previousRank: z.string(),
      rank: z.string(),
      rankPointProgress: z.number(),
      rankPoints: z.number(),
      winPercent: z.string(),
      wins: z.number(),
    }),
  }),
});

export const SR6StatsResult = z.object({
  code: z.number(),
  profiles: z.record(SR6ProfileStats),
});

export type TR6ProfileStats = z.infer<typeof SR6ProfileStats>;
export type TR6StatsResult = z.infer<typeof SR6StatsResult>;
