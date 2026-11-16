"use client"

import { useRef, useState, useTransition } from "react"
import type { z } from "zod"

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
import { Textarea } from "@/components/ui/textarea"

import type { TSettingOption, TSettingsUpdate } from "../schema"
import { settingsStore } from "../store"
import { SettingRow } from "./setting-row"

/** Same delay as the Nuxt store's `handleUpdateDebounce`. */
const SAVE_DEBOUNCE_MS = 500

type BaseProps<T> = {
  id: string
  label: string
  option: TSettingOption<T>
  disabled?: boolean
  /** Builds the partial update sent to the server for a new value. */
  toUpdate: (value: T) => TSettingsUpdate
}

/** Boolean setting (Nuxt `FancyToggle`): saves immediately. */
export function SwitchSetting({
  id,
  label,
  option,
  disabled,
  toUpdate,
}: BaseProps<boolean>) {
  const save = settingsStore.useStore((state) => state.save)
  const [saving, startSaving] = useTransition()

  return (
    <SettingRow
      id={id}
      label={label}
      option={option}
      disabled={disabled}
      saving={saving}
    >
      <Switch
        id={id}
        checked={option.value}
        disabled={saving}
        onCheckedChange={(checked) =>
          startSaving(async () => {
            await save(toUpdate(checked))
          })
        }
      />
    </SettingRow>
  )
}

/**
 * Text-like settings are edited as a local draft and saved 500 ms after the
 * last keystroke, but only while the draft is valid (the Nuxt page sent
 * every keystroke and let the server reject invalid ones). While a draft
 * exists the auto-refresh doesn't overwrite what the user is typing.
 */
function useDraftSetting<T>({
  value,
  format,
  parse,
  schema,
  toUpdate,
}: {
  value: T
  format: (value: T) => string
  parse: (text: string) => unknown
  schema: z.ZodType<T, z.ZodTypeDef, unknown>
  toUpdate: (value: T) => TSettingsUpdate
}) {
  const save = settingsStore.useStore((state) => state.save)
  const [draft, setDraft] = useState<string | null>(null)
  const [saving, startSaving] = useTransition()
  const timer = useRef<number | undefined>(undefined)

  const text = draft ?? format(value)
  const parsed = draft === null ? null : schema.safeParse(parse(draft))
  const error =
    parsed && !parsed.success ? parsed.error.issues[0]?.message : undefined

  function onChange(next: string) {
    setDraft(next)
    window.clearTimeout(timer.current)

    const result = schema.safeParse(parse(next))
    if (!result.success) return

    timer.current = window.setTimeout(() => {
      startSaving(async () => {
        const saved = await save(toUpdate(result.data))
        // Drop the draft (show the saved server value) unless the user
        // kept typing meanwhile.
        if (saved) setDraft((current) => (current === next ? null : current))
      })
    }, SAVE_DEBOUNCE_MS)
  }

  return { text, error, saving, onChange }
}

/** String setting (Nuxt `FormTextInput` / `FormTextarea`). */
export function TextSetting({
  id,
  label,
  option,
  disabled,
  toUpdate,
  schema,
  multiline,
}: BaseProps<string> & {
  schema: z.ZodType<string, z.ZodTypeDef, unknown>
  multiline?: boolean
}) {
  const { text, error, saving, onChange } = useDraftSetting({
    value: option.value,
    format: (value) => value,
    parse: (text) => text,
    schema,
    toUpdate,
  })
  const Control = multiline ? Textarea : Input

  return (
    <SettingRow
      id={id}
      label={label}
      option={option}
      disabled={disabled}
      saving={saving}
      error={error}
    >
      <Control
        id={id}
        name={id}
        value={text}
        aria-invalid={!!error || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </SettingRow>
  )
}

/** Number setting (Nuxt `FormNumberInput`). */
export function NumberSetting({
  id,
  label,
  option,
  disabled,
  toUpdate,
  schema,
}: BaseProps<number> & {
  schema: z.ZodType<number, z.ZodTypeDef, unknown>
}) {
  const { text, error, saving, onChange } = useDraftSetting({
    value: option.value,
    format: (value) => String(value),
    parse: (text) => (text.trim() === "" ? Number.NaN : Number(text)),
    schema,
    toUpdate,
  })

  return (
    <SettingRow
      id={id}
      label={label}
      option={option}
      disabled={disabled}
      saving={saving}
      error={error}
    >
      <Input
        id={id}
        name={id}
        type="number"
        inputMode="decimal"
        value={text}
        aria-invalid={!!error || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </SettingRow>
  )
}

/** String-list setting edited as comma separated text. */
export function ListSetting({
  id,
  label,
  option,
  disabled,
  toUpdate,
  schema,
  format,
  parse,
}: BaseProps<string[]> & {
  schema: z.ZodType<string[], z.ZodTypeDef, unknown>
  format: (value: string[]) => string
  parse: (text: string) => string[]
}) {
  const { text, error, saving, onChange } = useDraftSetting({
    value: option.value,
    format,
    parse,
    schema,
    toUpdate,
  })

  return (
    <SettingRow
      id={id}
      label={label}
      option={option}
      disabled={disabled}
      saving={saving}
      error={error}
    >
      <Textarea
        id={id}
        name={id}
        value={text}
        aria-invalid={!!error || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
    </SettingRow>
  )
}

/** Choice setting (Nuxt `CustomSelect`): saves on selection. */
export function SelectSetting({
  id,
  label,
  option,
  disabled,
  toUpdate,
  items,
}: BaseProps<string> & {
  items: { value: string; label: string }[]
}) {
  const save = settingsStore.useStore((state) => state.save)
  const [saving, startSaving] = useTransition()

  return (
    <SettingRow
      id={id}
      label={label}
      option={option}
      disabled={disabled}
      saving={saving}
    >
      <Select
        items={items}
        value={option.value}
        disabled={saving}
        onValueChange={(value) => {
          if (value === null || value === option.value) return
          startSaving(async () => {
            await save(toUpdate(value))
          })
        }}
      >
        <SelectTrigger id={id} className="w-full">
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
    </SettingRow>
  )
}
