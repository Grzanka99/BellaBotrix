"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { PermissionEntry } from "./schema"

/** Port of `store/permissions.store.ts` (the client half: list + search filter). */

export type PermissionsProps = {
  entries: PermissionEntry[]
}

type PermissionsState = {
  entries: PermissionEntry[]
  query: string
  setQuery: (query: string) => void
  replaceEntry: (entry: PermissionEntry) => void
}

export const permissionsStore = createStoreContext<
  PermissionsState,
  PermissionsProps
>({
  name: "PermissionsStore",
  create: (props) => (set) => ({
    entries: props.entries,
    query: "",
    setQuery: (query) => set({ query }),
    replaceEntry: (entry) =>
      set((state) => ({
        entries: state.entries.map((current) =>
          current.id === entry.id ? entry : current
        ),
      })),
  }),
  sync: (props) => ({ entries: props.entries }),
})

/** Users matching the search query (case-insensitive, by username). */
export function filterEntries(
  entries: PermissionEntry[],
  query: string
): PermissionEntry[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return entries
  return entries.filter((entry) =>
    entry.username.toLowerCase().includes(needle)
  )
}
