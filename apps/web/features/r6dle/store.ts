"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { R6dleOperator } from "./schema"

/** Port of `store/r6dle-operators.store.ts` (the client half: list + search filter). */

export type R6dleProps = {
  operators: R6dleOperator[]
  /** Whether the user may mutate (`r6dleadmin`, decided on the server). */
  canEdit: boolean
}

type R6dleState = {
  operators: R6dleOperator[]
  canEdit: boolean
  query: string
  setQuery: (query: string) => void
  patchOperator: (id: number, patch: Partial<R6dleOperator>) => void
}

export const r6dleStore = createStoreContext<R6dleState, R6dleProps>({
  name: "R6dleStore",
  create: (props) => (set) => ({
    operators: props.operators,
    canEdit: props.canEdit,
    query: "",
    setQuery: (query) => set({ query }),
    patchOperator: (id, patch) =>
      set((state) => ({
        operators: state.operators.map((operator) =>
          operator.id === id ? { ...operator, ...patch } : operator
        ),
      })),
  }),
  sync: (props) => ({ operators: props.operators, canEdit: props.canEdit }),
})

/** Operators matching the search query (case-insensitive, by name). */
export function filterOperators(
  operators: R6dleOperator[],
  query: string
): R6dleOperator[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return operators
  return operators.filter((operator) =>
    operator.name.toLowerCase().includes(needle)
  )
}
