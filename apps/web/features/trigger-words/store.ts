"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { TriggerWord } from "./schema"

/** Port of `store/trigger-words.store.ts` (the client half: list + search filter). */

export type TriggerWordsProps = {
  channelId: number
  triggerWords: TriggerWord[]
}

type TriggerWordsState = {
  channelId: number
  /** Server data; replaced whenever fresh props arrive. */
  triggerWords: TriggerWord[]
  query: string
  setQuery: (query: string) => void
  /** Optimistic local patch, e.g. the enabled switch before the action returns. */
  patchTriggerWord: (id: number, patch: Partial<TriggerWord>) => void
}

export const triggerWordsStore = createStoreContext<
  TriggerWordsState,
  TriggerWordsProps
>({
  name: "TriggerWordsStore",
  create: (props) => (set) => ({
    channelId: props.channelId,
    triggerWords: props.triggerWords,
    query: "",
    setQuery: (query) => set({ query }),
    patchTriggerWord: (id, patch) =>
      set((state) => ({
        triggerWords: state.triggerWords.map((word) =>
          word.id === id ? { ...word, ...patch } : word
        ),
      })),
  }),
  sync: (props) => ({
    channelId: props.channelId,
    triggerWords: props.triggerWords,
  }),
})

/** Same filter as the Nuxt store: triggers contain the query (case-insensitive). */
export function filterTriggerWords(
  triggerWords: TriggerWord[],
  query: string
): TriggerWord[] {
  const needle = query.toLowerCase()
  if (!needle) return triggerWords
  return triggerWords.filter((word) =>
    word.triggers.toLowerCase().includes(needle)
  )
}
