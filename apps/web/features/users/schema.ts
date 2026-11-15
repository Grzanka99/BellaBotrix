import { z } from "zod"

/**
 * Port of `types/chatters.type.ts`. Tightened: the id must be a
 * positive integer and `isBot` a real boolean (`z.coerce.boolean()` turned
 * the string "false" into `true`).
 */
export const SUpdateChatter = z.object({
  id: z.coerce.number().int().positive(),
  isBot: z.boolean(),
})

export type TUpdateChatter = z.infer<typeof SUpdateChatter>

/** Sort options of the Nuxt page (`ESortOptions` in `store/chatters.store.ts`). */
export const CHATTER_SORTS = [
  "none",
  "points-desc",
  "points-asc",
  "sent-desc",
  "sent-asc",
] as const

export type ChatterSort = (typeof CHATTER_SORTS)[number]

export const CHATTER_SORT_LABELS: Record<ChatterSort, string> = {
  none: "do not sort (default)",
  "points-desc": "sort by points desc.",
  "points-asc": "sort by points asc.",
  "sent-desc": "sort by sent desc.",
  "sent-asc": "sort by sent asc.",
}

export const SChatterSort = z.enum(CHATTER_SORTS).catch("none")

/** A chatter as sent to the client. */
export type Chatter = {
  id: number
  /** Twitch user id (shown as the username's tooltip, like Nuxt). */
  userid: string
  username: string
  sentMessages: number
  points: number
  isBot: boolean
}

/** Channel-wide numbers shown above the table (independent of search / page). */
export type ChatterTotals = {
  /** Non-bot chatters. */
  users: number
  /** Sum of non-bot points. */
  points: number
  /** Mean points of non-bot chatters (for the "can it be a bot" highlight). */
  meanPoints: number
}

/**
 * Port of `canItBeBot` in `pages/panel/users.vue`: a non-bot chatter with
 * above-average points who never sent a message looks like a bot.
 */
export function canItBeBot(chatter: Chatter, meanPoints: number): boolean {
  if (chatter.points < meanPoints || chatter.sentMessages > 0) return false
  return chatter.points > meanPoints && chatter.sentMessages === 0
}
