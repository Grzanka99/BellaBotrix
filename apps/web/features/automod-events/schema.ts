/** An automod event as sent to the client (read-only page, no input schemas). */
export type AutomodEvent = {
  id: number
  message: string
  /** Twitch user id of the target. */
  target: string
  action: string
  handler: string
  /** Seconds; -1 = permanent. */
  duration: number
}

/** Port of the duration cell of `pages/panel/automod-events.vue`. */
export function formatDuration(duration: number): string {
  return duration === -1 ? "permanent" : String(duration)
}
