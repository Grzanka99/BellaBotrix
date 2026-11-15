"use client"

import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

/** Labelled Select over a fixed option list (replaces the Nuxt `CustomSelect`). */
export function OptionSelect<T extends string | number>({
  id,
  label,
  options,
  value,
  onChange,
}: {
  id: string
  label: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  // Keep a stored value that is not in the list selectable (e.g. a newer
  // release year than the Nuxt options).
  const items = options.some((option) => option.value === value)
    ? options
    : [{ value, label: String(value) }, ...options]

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select
        items={items}
        value={value}
        onValueChange={(next) => {
          const found = items.find((option) => option.value === next)
          if (found) onChange(found.value)
        }}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {items.map((option) => (
              <SelectItem key={String(option.value)} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  )
}
