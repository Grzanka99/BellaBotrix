"use client"

import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { updateCommand } from "../actions"
import {
  DEFAULT_TIMEOUT,
  ETimeoutType,
  SUpdateCommand,
  type Command,
} from "../schema"
import { commandsStore } from "../store"
import {
  CommandOptionsFields,
  optionNumbers,
  type CommandOptions,
} from "./command-options-fields"
import { EditSubcommandForm } from "./edit-subcommand-form"
import { MessageFields } from "./message-fields"

/** Port of `EditCommandModal.vue` (+ `EditSubcommand.vue` per subcommand). */
export function EditCommandDialog({
  command,
  trigger,
  triggerLabel,
}: {
  command: Command
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Edit command: {command.name}</DialogTitle>
          <DialogDescription>
            Change the message, alias, price and timeout of the command.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open: starts from the saved values every time
            and isn't reset by the background refresh while editing. */}
        <EditCommandForm command={command} onDone={() => setOpen(false)} />
        {command.subCommands.length > 0 && (
          <div className="flex flex-col gap-6">
            <FieldSeparator />
            <h3 className="text-base font-semibold">Subcommands</h3>
            {command.subCommands.map((sub) => (
              <EditSubcommandForm key={sub.id} subcommand={sub} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function EditCommandForm({
  command,
  onDone,
}: {
  command: Command
  onDone: () => void
}) {
  const channelId = commandsStore.useStore((state) => state.channelId)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(command.message)
  const [alias, setAlias] = useState(command.alias)
  // Same defaults as the Nuxt modal (`|| 30`, `|| ETimeoutType.User`).
  const [options, setOptions] = useState<CommandOptions>({
    paid: command.paid,
    price: String(command.price || 0),
    errorMessage: command.errorMessage || "",
    timeoutEnabled: command.timeoutEnabled,
    timeout: String(command.timeout || DEFAULT_TIMEOUT),
    timeoutType: command.timeoutType || ETimeoutType.User,
  })

  const parsed = SUpdateCommand.safeParse({
    id: command.id,
    alias,
    message,
    paid: options.paid,
    errorMessage: options.errorMessage,
    timeoutEnabled: options.timeoutEnabled,
    timeoutType: options.timeoutType,
    ...optionNumbers(options, {
      price: command.price,
      timeout: command.timeout,
    }),
  })
  const errors = fieldErrors(parsed)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const payload = parsed.data

    startTransition(async () => {
      const result = await updateCommand(channelId, payload)
      if (!result.ok) {
        notifyActionError("Error occurred while updating command", result)
        return
      }
      notifySuccess("Command updated")
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldSet>
        <FieldLegend>Message</FieldLegend>
        <FieldGroup>
          <MessageFields
            idPrefix={`command-${command.id}`}
            value={message}
            original={command.message}
            onChange={setMessage}
          />
        </FieldGroup>
      </FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor={`command-${command.id}-alias`}>Alias</FieldLabel>
          <Input
            id={`command-${command.id}-alias`}
            value={alias}
            autoComplete="off"
            onChange={(event) => setAlias(event.target.value)}
          />
        </Field>
        <CommandOptionsFields
          idPrefix={`command-${command.id}`}
          value={options}
          onChange={(patch) => setOptions((prev) => ({ ...prev, ...patch }))}
          errors={errors}
        />
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  )
}
