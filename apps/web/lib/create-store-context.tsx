"use client"

import { createContext, useContext, useEffect, useRef, useState } from "react"
import { useStore } from "zustand"
import { shallow } from "zustand/shallow"
import { createStore, type StateCreator, type StoreApi } from "zustand/vanilla"

/**
 * zustand store per component tree, initialised from server props.
 *
 * Never put per-user server data in a module-global zustand store: on the
 * server, modules are shared by all requests. Instead each feature calls
 * this once (in `features/<feature>/store.ts`) and mounts the returned
 * Provider in its client component with the props from the server page:
 *
 *   export const timersStore = createStoreContext({
 *     name: "TimersStore",
 *     create: (props: { timers: Timer[] }) => (set) => ({ timers: props.timers, ... }),
 *     sync: (props) => ({ timers: props.timers }),
 *   })
 *
 *   <timersStore.Provider props={{ timers }}>...</timersStore.Provider>
 *   const timers = timersStore.useStore((s) => s.timers)
 *
 * `sync` is applied whenever the server-owned fields it returns change
 * (shallow compare; fresh data after `router.refresh()` / `revalidatePath`
 * arrives as new arrays/objects). Return only the server-owned fields so UI
 * state (search query, open dialogs) survives.
 */
export function createStoreContext<TState, TProps>({
  name,
  create,
  sync,
}: {
  name: string
  create: (props: TProps) => StateCreator<TState>
  sync?: (props: TProps) => Partial<TState>
}) {
  const StoreContext = createContext<StoreApi<TState> | null>(null)

  function Provider({
    props,
    children,
  }: {
    props: TProps
    children: React.ReactNode
  }) {
    const [store] = useState(() => createStore<TState>()(create(props)))
    const lastSynced = useRef<Partial<TState> | null>(sync ? sync(props) : null)

    useEffect(() => {
      if (!sync) return
      const next = sync(props)
      // Only push when the server data actually changed (shallow compare),
      // so unrelated re-renders don't overwrite optimistic client state.
      if (lastSynced.current && shallow(lastSynced.current, next)) return
      lastSynced.current = next
      store.setState(next)
    }, [store, props])

    return <StoreContext value={store}>{children}</StoreContext>
  }

  function useStoreApi(): StoreApi<TState> {
    const store = useContext(StoreContext)
    if (!store) {
      throw new Error(`${name} is used outside of its Provider`)
    }
    return store
  }

  function useBoundStore<T>(selector: (state: TState) => T): T {
    return useStore(useStoreApi(), selector)
  }

  return { Provider, useStore: useBoundStore, useStoreApi }
}
