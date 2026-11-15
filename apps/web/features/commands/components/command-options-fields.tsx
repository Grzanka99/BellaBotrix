"use client"

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import type { ETimeoutType } from "../schema"
import { TIMEOUT_TYPE_ITEMS } from "../schema"

/** Form state shared by the new / edit command dialogs (paid + timeout). */
export type CommandOptions = {
  paid: boolean
  /** Kept as strings while typing; parsed by the dialog's zod schema. */
  price: string
  errorMessage: string
  timeoutEnabled: boolean
  timeout: string
  timeoutType: ETimeoutType
}

type OptionErrors = Partial<
  Record<"price" | "errorMessage" | "timeout", { message: string }[]>
>

/** `""` -> NaN so an empty number input fails validation instead of becoming 0. */
export function toNumber(value: string): number {
  return value.trim() === "" ? Number.NaN : Number(value)
}

/**
 * Numeric values for the payload. A hidden section (paid / timeout switched
 * off) can't show its errors, so its invalid input falls back to `fallback`
 * instead of silently blocking the submit.
 */
export function optionNumbers(
  options: CommandOptions,
  fallback: { price: number; timeout: number }
): { price: number; timeout: number } {
  const valid = (n: number) => Number.isInteger(n) && n >= 0
  const price = toNumber(options.price)
  const timeout = toNumber(options.timeout)
  return {
    price: options.paid || valid(price) ? price : fallback.price,
    timeout:
      options.timeoutEnabled || valid(timeout) ? timeout : fallback.timeout,
  }
}

/**
 * The "paid (in points)" and "timeout" sections of `NewCommandModal.vue` /
 * `EditCommandModal.vue` (FancyToggle + inputs + CustomSelect).
 */
export function CommandOptionsFields({
  idPrefix,
  value,
  onChange,
  errors,
}: {
  idPrefix: string
  value: CommandOptions
  onChange: (patch: Partial<CommandOptions>) => void
  errors: OptionErrors
}) {
  return (
    <>
      <Field orientation="horizontal">
        <Switch
          id={`${idPrefix}-paid`}
          checked={value.paid}
          onCheckedChange={(paid) => onChange({ paid })}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${idPrefix}-paid`}>Paid (in points)</FieldLabel>
          <FieldDescription>
            Viewers spend channel points to run the command.
          </FieldDescription>
        </FieldContent>
      </Field>
      {value.paid && (
        <>
          <Field data-invalid={!!errors.price || undefined}>
            <FieldLabel htmlFor={`${idPrefix}-price`}>
              Price (in points)
            </FieldLabel>
            <Input
              id={`${idPrefix}-price`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={value.price}
              aria-invalid={!!errors.price || undefined}
              onChange={(event) => onChange({ price: event.target.value })}
            />
            <FieldError errors={errors.price} />
          </Field>
          <Field data-invalid={!!errors.errorMessage || undefined}>
            <FieldLabel htmlFor={`${idPrefix}-error-message`}>
              Error message
            </FieldLabel>
            <Input
              id={`${idPrefix}-error-message`}
              value={value.errorMessage}
              aria-invalid={!!errors.errorMessage || undefined}
              onChange={(event) =>
                onChange({ errorMessage: event.target.value })
              }
            />
            <FieldDescription>
              Sent when the viewer can&apos;t afford it. $points is replaced
              with the price.
            </FieldDescription>
            <FieldError errors={errors.errorMessage} />
          </Field>
        </>
      )}
      <Field orientation="horizontal">
        <Switch
          id={`${idPrefix}-timeout-enabled`}
          checked={value.timeoutEnabled}
          onCheckedChange={(timeoutEnabled) => onChange({ timeoutEnabled })}
        />
        <FieldContent>
          <FieldLabel htmlFor={`${idPrefix}-timeout-enabled`}>
            Timeout
          </FieldLabel>
          <FieldDescription>
            Should command invocation be limited.
          </FieldDescription>
        </FieldContent>
      </Field>
      {value.timeoutEnabled && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field data-invalid={!!errors.timeout || undefined}>
            <FieldLabel htmlFor={`${idPrefix}-timeout`}>
              Timeout (in seconds)
            </FieldLabel>
            <Input
              id={`${idPrefix}-timeout`}
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={value.timeout}
              aria-invalid={!!errors.timeout || undefined}
              onChange={(event) => onChange({ timeout: event.target.value })}
            />
            <FieldError errors={errors.timeout} />
          </Field>
          <Field>
            <FieldLabel htmlFor={`${idPrefix}-timeout-type`}>
              Timeout type
            </FieldLabel>
            <Select
              items={TIMEOUT_TYPE_ITEMS}
              value={value.timeoutType}
              onValueChange={(timeoutType) => {
                if (timeoutType) {
                  onChange({ timeoutType })
                }
              }}
            >
              <SelectTrigger id={`${idPrefix}-timeout-type`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {TIMEOUT_TYPE_ITEMS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </Field>
        </div>
      )}
    </>
  )
}
