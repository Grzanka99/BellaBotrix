"use client"

import { useState } from "react"

import { Input } from "@/components/ui/input"

/**
 * Number input that lets the user type freely and commits only valid values
 * (within `min`/`max`) to `onChange`. Reverts to `value` on blur if invalid.
 */
export function NumberField({
  value,
  onChange,
  min,
  max,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange" | "type"> & {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const [text, setText] = useState(String(value))
  const [lastValue, setLastValue] = useState(value)

  // Follow outside changes (e.g. after a drag) without an effect.
  if (value !== lastValue) {
    setLastValue(value)
    setText(String(value))
  }

  const valid = (n: number) =>
    Number.isFinite(n) &&
    (min === undefined || n >= min) &&
    (max === undefined || n <= max)

  return (
    <Input
      type="number"
      inputMode="numeric"
      min={min}
      max={max}
      value={text}
      aria-invalid={!valid(Number.parseFloat(text)) || undefined}
      className={className}
      onChange={(e) => {
        setText(e.target.value)
        const n = Number.parseFloat(e.target.value)
        if (valid(n)) {
          setLastValue(n)
          onChange(n)
        }
      }}
      onBlur={() => setText(String(value))}
      {...props}
    />
  )
}
