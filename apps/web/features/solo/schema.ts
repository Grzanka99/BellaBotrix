/** A solo duel as sent to the client (read-only page, no input schemas). */
export type Solo = {
  id: number
  user1: string
  user2: string
  inProgress: boolean
  points: number
  winner: string | null
}

/** Channel-wide numbers shown above the table (independent of search / page). */
export type SoloTotals = {
  total: number
  /** Solos with a winner (`!!winner`, like the Nuxt page). */
  finished: number
}
