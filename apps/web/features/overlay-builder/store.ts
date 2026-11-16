"use client"

import { useEffect, useSyncExternalStore } from "react"
import { create } from "zustand"
import { persist } from "zustand/middleware"

import {
  LEGACY_KEYS,
  legacyOverlayStorage,
  type PersistedOverlayState,
} from "./legacy-storage"
import type { EElementType } from "./schema"
import { elementSize, toPx, px, type TOverlayLocalStorageSave } from "./schema"

/**
 * Port of the `useStorage` refs in `pages/panel/overlay/builder.vue` and
 * `components/overlay-builder/*`. Purely client-side, per-browser editor
 * state (no server data), so a module-level store with `persist` is allowed
 * (README: client-side prefs). Persisted to the Nuxt localStorage keys via
 * `legacyOverlayStorage`.
 */
type OverlayState = PersistedOverlayState & {
  addElement: (element: EElementType) => void
  updateElement: (id: string, patch: Partial<TOverlayLocalStorageSave>) => void
  removeFocused: () => void
  setFocused: (id: string) => void
  setGridSize: (gridSize: number) => void
  setSnapToGrid: (snap: boolean) => void
  setCanvasSize: (width: number, height: number) => void
  setCanvasScale: (scale: number) => void
  setChatTimeout: (ms: number) => void
}

export const useOverlayStore = create<OverlayState>()(
  persist(
    (set) => ({
      // Defaults = the `useStorage` defaults in the Nuxt code.
      elements: {},
      focused: "",
      gridSize: 20,
      snapToGrid: false,
      canvasWidth: 1920,
      canvasHeight: 1080,
      canvasScale: 90,
      chatTimeout: 1000,

      addElement: (element) =>
        set((s) => ({
          elements: {
            ...s.elements,
            [crypto.randomUUID()]: { top: "100px", left: "0px", element },
          },
        })),
      updateElement: (id, patch) =>
        set((s) => {
          const current = s.elements[id]
          if (!current) return s
          return {
            elements: {
              ...s.elements,
              [id]: { ...current, ...patch } as TOverlayLocalStorageSave,
            },
          }
        }),
      removeFocused: () =>
        set((s) => {
          if (!(s.focused in s.elements)) return s
          const rest = { ...s.elements }
          delete rest[s.focused]
          return { elements: rest, focused: "" }
        }),
      setFocused: (focused) => set({ focused }),
      setGridSize: (gridSize) => set({ gridSize }),
      setSnapToGrid: (snapToGrid) => set({ snapToGrid }),
      setCanvasSize: (canvasWidth, canvasHeight) =>
        set((s) => {
          // Draggable.vue: an element that ends up outside the new canvas is
          // moved back so its far edge touches the canvas edge (Nuxt only
          // checked the near edge; any overflow is corrected here).
          const elements = { ...s.elements }
          for (const [id, el] of Object.entries(elements)) {
            const { width, height } = elementSize(el)
            const patch: Partial<TOverlayLocalStorageSave> = {}
            if (px(el.left) + width > canvasWidth) {
              patch.left = toPx(Math.max(0, canvasWidth - width))
            }
            if (px(el.top) + height > canvasHeight) {
              patch.top = toPx(Math.max(0, canvasHeight - height))
            }
            if (patch.left || patch.top) {
              elements[id] = { ...el, ...patch } as TOverlayLocalStorageSave
            }
          }
          return { canvasWidth, canvasHeight, elements }
        }),
      setCanvasScale: (canvasScale) => set({ canvasScale }),
      setChatTimeout: (chatTimeout) => set({ chatTimeout }),
    }),
    {
      name: "overlay-builder",
      storage: legacyOverlayStorage,
      skipHydration: true,
      partialize: (s): PersistedOverlayState => ({
        elements: s.elements,
        focused: s.focused,
        gridSize: s.gridSize,
        snapToGrid: s.snapToGrid,
        canvasWidth: s.canvasWidth,
        canvasHeight: s.canvasHeight,
        canvasScale: s.canvasScale,
        chatTimeout: s.chatTimeout,
      }),
    }
  )
)

function subscribeHydration(onChange: () => void) {
  return useOverlayStore.persist.onFinishHydration(onChange)
}

/**
 * Loads the saved layout on the client after mount (the server and first
 * client render use defaults, so there is no hydration mismatch) and keeps it
 * in sync with other tabs, like `useStorage`. Returns whether it has loaded.
 */
export function useOverlayHydration(): boolean {
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    () => useOverlayStore.persist.hasHydrated(),
    () => false
  )

  useEffect(() => {
    void useOverlayStore.persist.rehydrate()
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || LEGACY_KEYS.includes(e.key)) {
        void useOverlayStore.persist.rehydrate()
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  return hydrated
}
