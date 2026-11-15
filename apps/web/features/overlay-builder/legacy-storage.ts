import type { PersistStorage, StorageValue } from "zustand/middleware"

import {
  LSK_CHAT_TIMEOUT,
  LSK_OVERLAY_FOCUSED,
  LSK_OVERLAY_GRID,
  LSK_OVERLAY_H,
  LSK_OVERLAY_SAVE,
  LSK_OVERLAY_SCALE,
  LSK_OVERLAY_SNAP,
  LSK_OVERLAY_W,
  type OverlaySave,
} from "./schema"

/** The fields that are persisted, one legacy localStorage key each. */
export type PersistedOverlayState = {
  elements: OverlaySave
  focused: string
  gridSize: number
  snapToGrid: boolean
  canvasWidth: number
  canvasHeight: number
  canvasScale: number
  chatTimeout: number
}

/**
 * Serialisers matching `@vueuse/core` `useStorage` (StorageSerializers):
 * objects as JSON, strings raw, numbers via `String` / `parseFloat`,
 * booleans as `"true"` / `"false"`.
 */
type Serializer<T> = {
  read: (raw: string) => T | undefined
  write: (value: T) => string
}

const objectS: Serializer<OverlaySave> = {
  read: (raw) => {
    try {
      const parsed: unknown = JSON.parse(raw)
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return sanitizeSave(parsed as Record<string, unknown>)
      }
    } catch {
      // ignore malformed value, fall back to default
    }
    return undefined
  },
  write: (v) => JSON.stringify(v),
}

const stringS: Serializer<string> = { read: (raw) => raw, write: (v) => v }

const numberS: Serializer<number> = {
  read: (raw) => {
    const n = Number.parseFloat(raw)
    return Number.isFinite(n) ? n : undefined
  },
  write: (v) => String(v),
}

const booleanS: Serializer<boolean> = {
  read: (raw) => raw === "true",
  write: (v) => String(v),
}

const FIELDS: {
  [K in keyof PersistedOverlayState]: {
    key: string
    s: Serializer<PersistedOverlayState[K]>
  }
} = {
  elements: { key: LSK_OVERLAY_SAVE, s: objectS },
  focused: { key: LSK_OVERLAY_FOCUSED, s: stringS },
  gridSize: { key: LSK_OVERLAY_GRID, s: numberS },
  snapToGrid: { key: LSK_OVERLAY_SNAP, s: booleanS },
  canvasWidth: { key: LSK_OVERLAY_W, s: numberS },
  canvasHeight: { key: LSK_OVERLAY_H, s: numberS },
  canvasScale: { key: LSK_OVERLAY_SCALE, s: numberS },
  chatTimeout: { key: LSK_CHAT_TIMEOUT, s: numberS },
}

export const LEGACY_KEYS = Object.values(FIELDS).map((f) => f.key)

/** Keep only entries that look like elements; values must be strings. */
function sanitizeSave(raw: Record<string, unknown>): OverlaySave {
  const out: OverlaySave = {}
  for (const [id, value] of Object.entries(raw)) {
    if (!value || typeof value !== "object") continue
    const entry = value as Record<string, unknown>
    if (typeof entry.element !== "string") continue
    const clean: Record<string, string> = {}
    for (const [k, v] of Object.entries(entry)) {
      if (typeof v === "string") clean[k] = v
    }
    out[id] = {
      ...clean,
      top: clean.top ?? "0px",
      left: clean.left ?? "0px",
    } as OverlaySave[string]
  }
  return out
}

function safeStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

/**
 * zustand `persist` storage that reads/writes the individual Nuxt keys
 * instead of one `{ state, version }` blob, so layouts saved by the old
 * panel load here and vice versa. Only keys that differ are rewritten.
 */
export const legacyOverlayStorage: PersistStorage<
  Partial<PersistedOverlayState>
> = {
  getItem: () => {
    const ls = safeStorage()
    if (!ls) return null
    const state: Partial<PersistedOverlayState> = {}
    for (const [field, { key, s }] of Object.entries(FIELDS)) {
      const raw = ls.getItem(key)
      if (raw === null) continue
      const value = s.read(raw)
      if (value !== undefined) {
        ;(state as Record<string, unknown>)[field] = value
      }
    }
    return { state, version: 0 }
  },
  setItem: (_name, value: StorageValue<Partial<PersistedOverlayState>>) => {
    const ls = safeStorage()
    if (!ls) return
    for (const [field, { key, s }] of Object.entries(FIELDS)) {
      const v = (value.state as Record<string, unknown>)[field]
      if (v === undefined) continue
      const raw = (s.write as (x: unknown) => string)(v)
      try {
        if (ls.getItem(key) !== raw) ls.setItem(key, raw)
      } catch {
        // quota / blocked storage: keep working in memory
      }
    }
  },
  removeItem: () => {
    const ls = safeStorage()
    if (!ls) return
    for (const key of LEGACY_KEYS) ls.removeItem(key)
  },
}
