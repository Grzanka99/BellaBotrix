"use client"

import { RotateCcwIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"

import type { CommandMessage } from "../schema"
import { MessagePreview } from "./message-preview"

/**
 * One textarea per message key (`FormTextarea v-for="(_, key) in message"`
 * with `:restore` in the Nuxt modals): restore puts back the saved text.
 */
export function MessageFields({
  idPrefix,
  value,
  original,
  onChange,
}: {
  idPrefix: string
  value: CommandMessage
  original: CommandMessage
  onChange: (next: CommandMessage) => void
}) {
  const keys = Object.keys(value)

  if (keys.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This command has no message to edit.
      </p>
    )
  }

  return keys.map((key) => {
    const id = `${idPrefix}-message-${key}`
    const changed = value[key] !== original[key]
    return (
      <Field key={key}>
        <div className="flex items-center justify-between gap-2">
          <FieldLabel htmlFor={id} className="font-mono">
            {key}
          </FieldLabel>
          {changed && original[key] !== undefined && (
            <Button
              type="button"
              variant="ghost"
              size="xs"
              onClick={() => onChange({ ...value, [key]: original[key] })}
            >
              <RotateCcwIcon data-icon="inline-start" />
              Restore
            </Button>
          )}
        </div>
        <Textarea
          id={id}
          value={value[key]}
          onChange={(event) =>
            onChange({ ...value, [key]: event.target.value })
          }
        />
        <MessagePreview message={value[key]} />
      </Field>
    )
  })
}
