"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { ChattersPage } from "./queries"
import type { Chatter, ChatterSort } from "./schema"

/**
 * Port of `store/chatters.store.ts` (the client half). Search, sort and page
 * live in the URL; the store holds the current page of rows so the bot
 * switch can update optimistically.
 */

export type UsersProps = {
  channelId: number
  data: ChattersPage
  sort: ChatterSort
}

type UsersState = {
  channelId: number
  data: ChattersPage
  patchChatter: (id: number, patch: Partial<Chatter>) => void
}

export const usersStore = createStoreContext<UsersState, UsersProps>({
  name: "UsersStore",
  create: (props) => (set) => ({
    channelId: props.channelId,
    data: props.data,
    patchChatter: (id, patch) =>
      set((state) => ({
        data: {
          ...state.data,
          rows: state.data.rows.map((row) =>
            row.id === id ? { ...row, ...patch } : row
          ),
        },
      })),
  }),
  sync: (props) => ({ channelId: props.channelId, data: props.data }),
})
