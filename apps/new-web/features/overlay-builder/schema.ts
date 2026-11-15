/**
 * Port of `apps/web/types/overlay.type.ts` (the parts the builder uses) and
 * the `LSK_OVERLAY_*` localStorage keys from `apps/web/constants.ts`.
 */

export enum EElementType {
  Chat = "chat",
  Text = "text",
  Alert = "alert",
  Image = "image",
}

/**
 * One element in the saved layout. Same shape as the Nuxt type: positions are
 * `"<n>px"` strings; extra string fields are allowed. The new builder adds
 * `width` / `height` (also `"<n>px"`) once an element has been resized.
 */
export type TOverlayLocalStorageSave = {
  top: string
  left: string
  element: EElementType
  [key: string]: string
}

/** Saved layout: element uuid → element. */
export type OverlaySave = Record<string, TOverlayLocalStorageSave>

export const LSK_OVERLAY_SAVE = "overlay-builder/save"
export const LSK_OVERLAY_FOCUSED = "overlay-builder/focused"
export const LSK_OVERLAY_SNAP = "overlay-builder/snap-to-grid"
export const LSK_OVERLAY_GRID = "overlay-builder/grid-size"
export const LSK_OVERLAY_W = "overlay-builder/width"
export const LSK_OVERLAY_H = "overlay-builder/height"
export const LSK_OVERLAY_SCALE = "overlay-builder/scale"
/** Key used by the Nuxt Chat preview (`useStorage("timeoutvalue", 1000)`). */
export const LSK_CHAT_TIMEOUT = "timeoutvalue"

export const SCALE_MIN = 50
export const SCALE_MAX = 120
export const MIN_ELEMENT_SIZE = 20

export const ELEMENT_OPTIONS: {
  value: EElementType
  label: string
  disabled?: boolean
}[] = [
  { value: EElementType.Chat, label: "Chat" },
  { value: EElementType.Text, label: "Text" },
  { value: EElementType.Alert, label: "Alert", disabled: true },
  { value: EElementType.Image, label: "Image", disabled: true },
]

export const CANVAS_SIZE_PRESETS = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
]

/** Natural size of each element type before it is resized (Chat.vue: 400x600). */
const DEFAULT_SIZES: Record<EElementType, { width: number; height: number }> = {
  [EElementType.Chat]: { width: 400, height: 600 },
  [EElementType.Text]: { width: 200, height: 60 },
  [EElementType.Alert]: { width: 300, height: 200 },
  [EElementType.Image]: { width: 300, height: 200 },
}

/** `"12px"` → 12 (0 when missing or malformed). */
export function px(value: string | undefined): number {
  const n = Number.parseFloat(value ?? "")
  return Number.isFinite(n) ? n : 0
}

export function toPx(n: number): string {
  return `${Math.round(n)}px`
}

/** Effective size of an element: its saved width/height or the type default. */
export function elementSize(el: TOverlayLocalStorageSave): {
  width: number
  height: number
} {
  const fallback = DEFAULT_SIZES[el.element] ?? DEFAULT_SIZES.text
  return {
    width: px(el.width) || fallback.width,
    height: px(el.height) || fallback.height,
  }
}
