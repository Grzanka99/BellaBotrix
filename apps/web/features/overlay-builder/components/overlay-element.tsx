"use client"

import { memo, useRef, useState } from "react"
import { MoveDownRightIcon } from "lucide-react"

import { cn } from "@/lib/utils"

import {
  EElementType,
  MIN_ELEMENT_SIZE,
  elementSize,
  px,
  toPx,
  type TOverlayLocalStorageSave,
} from "../schema"
import { useOverlayStore } from "../store"
import { ChatElement } from "./chat-element"

type Box = { top: number; left: number; width: number; height: number }

type Gesture = {
  kind: "move" | "resize"
  pointerId: number
  startX: number
  startY: number
  start: Box
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(Math.max(v, min), Math.max(min, max))

/**
 * Port of `Draggable.vue` + `Resizable.vue`: one element on the canvas.
 *
 * Pointer math (same as Nuxt, which read `offsetX/offsetY` in the unscaled
 * canvas space): a pointer delta of N screen px moves the element N / scale
 * canvas px; the position is clamped to the canvas, then snapped to the grid.
 * During a gesture only this component re-renders (local draft box); the
 * store / localStorage are written once, on pointer up.
 */
export const OverlayElement = memo(function OverlayElement({
  id,
  element,
  focused,
  scale,
  canvasWidth,
  canvasHeight,
  snap,
}: {
  id: string
  element: TOverlayLocalStorageSave
  focused: boolean
  /** Canvas scale factor (1 = 100%). */
  scale: number
  canvasWidth: number
  canvasHeight: number
  /** Grid size when snap-to-grid is on. */
  snap: number | undefined
}) {
  const [draft, setDraft] = useState<Box | null>(null)
  const gesture = useRef<Gesture | null>(null)

  const saved: Box = {
    top: px(element.top),
    left: px(element.left),
    ...elementSize(element),
  }
  const box = draft ?? saved

  function begin(kind: Gesture["kind"], e: React.PointerEvent<HTMLElement>) {
    if (e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    try {
      // Keep receiving moves when the pointer leaves the element.
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      // pointer already released (e.g. synthetic events)
    }
    useOverlayStore.getState().setFocused(id)
    gesture.current = {
      kind,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      start: saved,
    }
    setDraft(saved)
  }

  function move(e: React.PointerEvent<HTMLElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return
    e.preventDefault()
    const dx = (e.clientX - g.startX) / scale
    const dy = (e.clientY - g.startY) / scale
    const { start } = g

    if (g.kind === "move") {
      let left = clamp(start.left + dx, 0, canvasWidth - start.width)
      let top = clamp(start.top + dy, 0, canvasHeight - start.height)
      if (snap) {
        left = Math.round(left / snap) * snap
        top = Math.round(top / snap) * snap
      }
      setDraft({ ...start, left, top })
    } else {
      let width = clamp(
        start.width + dx,
        MIN_ELEMENT_SIZE,
        canvasWidth - start.left
      )
      let height = clamp(
        start.height + dy,
        MIN_ELEMENT_SIZE,
        canvasHeight - start.top
      )
      if (snap) {
        width = Math.max(snap, Math.round(width / snap) * snap)
        height = Math.max(snap, Math.round(height / snap) * snap)
      }
      setDraft({ ...start, width, height })
    }
  }

  function end(e: React.PointerEvent<HTMLElement>) {
    const g = gesture.current
    if (!g || g.pointerId !== e.pointerId) return
    gesture.current = null
    if (draft) {
      useOverlayStore
        .getState()
        .updateElement(
          id,
          g.kind === "move"
            ? { top: toPx(draft.top), left: toPx(draft.left) }
            : { width: toPx(draft.width), height: toPx(draft.height) }
        )
    }
    setDraft(null)
  }

  const handlers = {
    onPointerMove: move,
    onPointerUp: end,
    onPointerCancel: end,
  }

  return (
    <>
      <div
        data-overlay-element={id}
        className={cn(
          "absolute flex cursor-grab touch-none items-center justify-center select-none",
          draft && "cursor-grabbing",
          (focused || draft) && "outline-2 outline-amber-500"
        )}
        style={{
          top: box.top,
          left: box.left,
          width: box.width,
          height: box.height,
        }}
        onPointerDown={(e) => begin("move", e)}
        {...handlers}
      >
        <div className="relative size-full overflow-hidden">
          {element.element === EElementType.Chat ? (
            <ChatElement />
          ) : element.element === EElementType.Text ? (
            <div className="flex size-full items-center justify-center text-black">
              hellow there
            </div>
          ) : (
            <div className="flex size-full items-center justify-center bg-black/10 text-xs text-black">
              {element.element}
            </div>
          )}
        </div>
        <button
          type="button"
          aria-label="Resize element"
          className="absolute right-0 bottom-0 flex size-5 cursor-se-resize touch-none items-center justify-center bg-amber-500/80 text-white"
          onPointerDown={(e) => begin("resize", e)}
          {...handlers}
        >
          <MoveDownRightIcon className="size-4" />
        </button>
      </div>
      {focused && <GuideLines box={box} />}
    </>
  )
})

/** Draggable.vue: distance lines from the canvas' left and top edges. */
function GuideLines({ box }: { box: Box }) {
  return (
    <>
      <div
        className="pointer-events-none absolute left-0 flex h-1 items-center justify-center bg-gray-500/80"
        style={{ width: box.left, top: box.top + box.height / 2 - 2 }}
      >
        <span className="relative -top-3 font-mono text-xs text-amber-600">
          {toPx(box.left)}
        </span>
      </div>
      <div
        className="pointer-events-none absolute top-0 flex w-1 items-center justify-center bg-gray-500/80"
        style={{ height: box.top, left: box.left + box.width / 2 - 2 }}
      >
        <span className="relative left-6 rotate-90 font-mono text-xs text-amber-600">
          {toPx(box.top)}
        </span>
      </div>
    </>
  )
}
