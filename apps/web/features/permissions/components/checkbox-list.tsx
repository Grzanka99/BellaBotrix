"use client"

import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"

/**
 * Multi-select as a checkbox group (replaces the Nuxt `FancyMultipleToggle`).
 * Keeps `options` order in the emitted value.
 */
export function CheckboxList<T extends string>({
  id,
  legend,
  options,
  value,
  onChange,
  invalid,
}: {
  id: string
  legend: string
  options: { value: T; label: string }[]
  value: T[]
  onChange: (value: T[]) => void
  invalid?: boolean
}) {
  function toggle(option: T, checked: boolean) {
    const next = new Set(value)
    if (checked) next.add(option)
    else next.delete(option)
    // Options first (in order), then anything unknown that was already set.
    onChange([
      ...options.map((o) => o.value).filter((v) => next.has(v)),
      ...value.filter(
        (v) => next.has(v) && !options.some((o) => o.value === v)
      ),
    ])
  }

  return (
    <FieldSet data-invalid={invalid || undefined}>
      <FieldLegend variant="label">{legend}</FieldLegend>
      <FieldGroup
        data-slot="checkbox-group"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {options.map((option) => {
          const checkboxId = `${id}-${option.value}`
          return (
            <Field key={option.value} orientation="horizontal">
              <Checkbox
                id={checkboxId}
                checked={value.includes(option.value)}
                aria-invalid={invalid || undefined}
                onCheckedChange={(checked) => toggle(option.value, checked)}
              />
              <FieldLabel htmlFor={checkboxId} className="font-normal">
                {option.label}
              </FieldLabel>
            </Field>
          )
        })}
      </FieldGroup>
    </FieldSet>
  )
}
