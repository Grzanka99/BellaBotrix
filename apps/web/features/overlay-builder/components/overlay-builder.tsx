"use client"

import { PlusIcon, Trash2Icon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Field, FieldLabel } from "@/components/ui/field"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

import {
  CANVAS_SIZE_PRESETS,
  ELEMENT_OPTIONS,
  SCALE_MAX,
  SCALE_MIN,
} from "../schema"
import { useOverlayHydration, useOverlayStore } from "../store"
import { ElementOptions } from "./element-options"
import { NumberField } from "./number-field"
import { OverlayCanvas } from "./overlay-canvas"

/**
 * Port of `pages/panel/overlay/builder.vue`: toolbar on top, the canvas
 * scrolls inside the remaining content area. Everything is client-side and
 * persisted in localStorage (Nuxt keys); nothing renders until the saved
 * layout has been loaded, so there is no hydration mismatch.
 */
export function OverlayBuilder() {
  const hydrated = useOverlayHydration()

  return (
    // `contain: inline-size` keeps the wide canvas from stretching the panel
    // shell; the canvas scrolls inside its own box instead.
    <div className="flex h-[calc(100svh-3.5rem-2rem)] min-h-96 flex-col gap-4 [contain:inline-size] md:h-[calc(100svh-3.5rem-3rem)]">
      <h1 className="sr-only">Overlay builder</h1>
      {hydrated ? (
        <>
          <Toolbar />
          <div className="flex min-h-0 flex-1 overflow-auto border bg-muted p-4">
            <OverlayCanvas />
          </div>
        </>
      ) : (
        <>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="flex-1" />
        </>
      )}
    </div>
  )
}

function Toolbar() {
  const focused = useOverlayStore((s) => s.focused)
  const hasFocused = useOverlayStore((s) => s.focused in s.elements)
  const gridSize = useOverlayStore((s) => s.gridSize)
  const snapToGrid = useOverlayStore((s) => s.snapToGrid)
  const canvasScale = useOverlayStore((s) => s.canvasScale)
  const addElement = useOverlayStore((s) => s.addElement)
  const removeFocused = useOverlayStore((s) => s.removeFocused)
  const setFocused = useOverlayStore((s) => s.setFocused)
  const setGridSize = useOverlayStore((s) => s.setGridSize)
  const setSnapToGrid = useOverlayStore((s) => s.setSnapToGrid)
  const setCanvasScale = useOverlayStore((s) => s.setCanvasScale)

  return (
    <div className="flex flex-wrap items-end gap-x-4 gap-y-3">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button size="sm" />}>
          <PlusIcon data-icon="inline-start" />
          Add element
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-40">
          {ELEMENT_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              disabled={option.disabled}
              onClick={() => addElement(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <CanvasSizeSelect />

      <Field className="w-44">
        <FieldLabel htmlFor="overlay-scale">Scale: {canvasScale}%</FieldLabel>
        <Slider
          id="overlay-scale"
          min={SCALE_MIN}
          max={SCALE_MAX}
          step={1}
          value={[canvasScale]}
          onValueChange={(v) => setCanvasScale(Array.isArray(v) ? v[0] : v)}
          className="h-9"
        />
      </Field>

      <Field className="w-24">
        <FieldLabel htmlFor="overlay-grid">Grid size</FieldLabel>
        <NumberField
          id="overlay-grid"
          value={gridSize}
          min={2}
          max={500}
          onChange={setGridSize}
          className="h-9"
        />
      </Field>

      <div className="flex h-9 items-center gap-2">
        <Switch
          id="overlay-snap"
          checked={snapToGrid}
          onCheckedChange={setSnapToGrid}
        />
        <Label htmlFor="overlay-snap">Snap to grid</Label>
      </div>

      <Separator orientation="vertical" className="h-9" />

      <ElementOptions />
      <Button
        variant="outline"
        size="sm"
        disabled={focused === ""}
        onClick={() => setFocused("")}
      >
        <XIcon data-icon="inline-start" />
        Unfocus
      </Button>
      <Button
        variant="destructive"
        size="sm"
        disabled={!hasFocused}
        onClick={removeFocused}
      >
        <Trash2Icon data-icon="inline-start" />
        Delete element
      </Button>
    </div>
  )
}

function CanvasSizeSelect() {
  const width = useOverlayStore((s) => s.canvasWidth)
  const height = useOverlayStore((s) => s.canvasHeight)
  const setCanvasSize = useOverlayStore((s) => s.setCanvasSize)

  const current = `${width}x${height}`
  const items = CANVAS_SIZE_PRESETS.map((p) => ({
    value: `${p.width}x${p.height}`,
    label: `${p.width}x${p.height}`,
  }))
  // A size saved by hand (not a preset) still shows up.
  if (!items.some((i) => i.value === current)) {
    items.push({ value: current, label: current })
  }

  return (
    <Field className="w-36">
      <FieldLabel>Canvas size</FieldLabel>
      <Select
        items={items}
        value={current}
        onValueChange={(v) => {
          if (!v) return
          const [w, h] = v.split("x").map(Number)
          if (w > 0 && h > 0) setCanvasSize(w, h)
        }}
      >
        <SelectTrigger aria-label="Canvas size" className="h-9 w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
