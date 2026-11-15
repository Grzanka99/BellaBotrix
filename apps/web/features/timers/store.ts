"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { Timer } from "./schema"

/** Port of `store/timers.store.ts` (the client half: list + search filter). */

export type TimersProps = {
  channelId: number
  timers: Timer[]
}

type TimersState = {
  channelId: number
  /** Server data; replaced whenever fresh props arrive. */
  timers: Timer[]
  query: string
  setQuery: (query: string) => void
  /** Optimistic local patch, e.g. the enabled switch before the action returns. */
  patchTimer: (id: number, patch: Partial<Timer>) => void
}

export const timersStore = createStoreContext<TimersState, TimersProps>({
  name: "TimersStore",
  create: (props) => (set) => ({
    channelId: props.channelId,
    timers: props.timers,
    query: "",
    setQuery: (query) => set({ query }),
    patchTimer: (id, patch) =>
      set((state) => ({
        timers: state.timers.map((timer) =>
          timer.id === id ? { ...timer, ...patch } : timer
        ),
      })),
  }),
  sync: (props) => ({ channelId: props.channelId, timers: props.timers }),
})

/** Timers matching the search query (case-insensitive, by message). */
export function filterTimers(timers: Timer[], query: string): Timer[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return timers
  return timers.filter((timer) => timer.message.toLowerCase().includes(needle))
}
