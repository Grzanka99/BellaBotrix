"use client"

import { SlidersHorizontalIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

import {
  EElementType,
  MIN_ELEMENT_SIZE,
  elementSize,
  px,
  toPx,
} from "../schema"
import { useOverlayStore } from "../store"
import { NumberField } from "./number-field"

/** Exact position/size of the focused element, plus its type's options. */
export function ElementOptions() {
  const focused = useOverlayStore((s) => s.focused)
  const element = useOverlayStore((s) => s.elements[s.focused])

  return (
    <Popover>
      <PopoverTrigger
        render={<Button variant="outline" size="sm" disabled={!element} />}
      >
        <SlidersHorizontalIcon data-icon="inline-start" />
        Element options
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72">
        {element ? (
          <ElementOptionsForm id={focused} />
        ) : (
          <PopoverDescription>Select an element first.</PopoverDescription>
        )}
      </PopoverContent>
    </Popover>
  )
}

function ElementOptionsForm({ id }: { id: string }) {
  const element = useOverlayStore((s) => s.elements[id])
  const canvasWidth = useOverlayStore((s) => s.canvasWidth)
  const canvasHeight = useOverlayStore((s) => s.canvasHeight)
  const chatTimeout = useOverlayStore((s) => s.chatTimeout)
  const updateElement = useOverlayStore((s) => s.updateElement)
  const setChatTimeout = useOverlayStore((s) => s.setChatTimeout)

  if (!element) return null
  const { width, height } = elementSize(element)

  return (
    <div className="flex flex-col gap-4">
      <PopoverHeader>
        <PopoverTitle className="capitalize">{element.element}</PopoverTitle>
        <PopoverDescription>Position and size in canvas px.</PopoverDescription>
      </PopoverHeader>
      <FieldGroup className="grid grid-cols-2 gap-3">
        <Field>
          <FieldLabel htmlFor="overlay-el-left">X</FieldLabel>
          <NumberField
            id="overlay-el-left"
            value={px(element.left)}
            min={0}
            max={Math.max(0, canvasWidth - width)}
            onChange={(v) => updateElement(id, { left: toPx(v) })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="overlay-el-top">Y</FieldLabel>
          <NumberField
            id="overlay-el-top"
            value={px(element.top)}
            min={0}
            max={Math.max(0, canvasHeight - height)}
            onChange={(v) => updateElement(id, { top: toPx(v) })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="overlay-el-width">Width</FieldLabel>
          <NumberField
            id="overlay-el-width"
            value={width}
            min={MIN_ELEMENT_SIZE}
            max={canvasWidth - px(element.left)}
            onChange={(v) => updateElement(id, { width: toPx(v) })}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="overlay-el-height">Height</FieldLabel>
          <NumberField
            id="overlay-el-height"
            value={height}
            min={MIN_ELEMENT_SIZE}
            max={canvasHeight - px(element.top)}
            onChange={(v) => updateElement(id, { height: toPx(v) })}
          />
        </Field>
        {element.element === EElementType.Chat && (
          <Field className="col-span-2">
            <FieldLabel htmlFor="overlay-chat-timeout">
              Max delay between preview messages (ms)
            </FieldLabel>
            <NumberField
              id="overlay-chat-timeout"
              value={chatTimeout}
              min={0}
              onChange={setChatTimeout}
            />
          </Field>
        )}
      </FieldGroup>
    </div>
  )
}
