"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { updateSubCommand } from "../actions"
import { SUpdateSubCommand, type SubCommand } from "../schema"
import { commandsStore } from "../store"
import { MessageFields } from "./message-fields"

/** Port of `EditSubcommand.vue`: message + alias, reset / update. */
export function EditSubcommandForm({ subcommand }: { subcommand: SubCommand }) {
  const channelId = commandsStore.useStore((state) => state.channelId)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(subcommand.message)
  const [alias, setAlias] = useState(subcommand.alias)

  const parsed = SUpdateSubCommand.safeParse({
    id: subcommand.id,
    alias,
    message,
  })

  function onReset() {
    setAlias(subcommand.alias)
    setMessage(subcommand.message)
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const payload = parsed.data

    startTransition(async () => {
      const result = await updateSubCommand(channelId, payload)
      if (!result.ok) {
        notifyActionError("Error occurred while updating subcommand", result)
        return
      }
      notifySuccess(`Subcommand ${subcommand.name} updated`)
    })
  }

  const aliasId = `subcommand-${subcommand.id}-alias`

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <FieldSet>
        <FieldLegend>{subcommand.name}</FieldLegend>
        <FieldGroup>
          <MessageFields
            idPrefix={`subcommand-${subcommand.id}`}
            value={message}
            original={subcommand.message}
            onChange={setMessage}
          />
          <Field>
            <FieldLabel htmlFor={aliasId}>Alias</FieldLabel>
            <Input
              id={aliasId}
              value={alias}
              autoComplete="off"
              onChange={(event) => setAlias(event.target.value)}
            />
          </Field>
        </FieldGroup>
      </FieldSet>
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          onClick={onReset}
        >
          Reset {subcommand.name}
        </Button>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Update {subcommand.name}
        </Button>
      </div>
    </form>
  )
}
