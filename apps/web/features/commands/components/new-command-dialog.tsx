"use client"

import { useEffect, useState, useTransition } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { createCommand, isCommandNameTaken } from "../actions"
import {
  DEFAULT_ERROR_MESSAGE,
  DEFAULT_TIMEOUT,
  ETimeoutType,
  SCreateCommand,
} from "../schema"
import { commandsStore } from "../store"
import {
  CommandOptionsFields,
  optionNumbers,
  type CommandOptions,
} from "./command-options-fields"
import { MessagePreview } from "./message-preview"

/** Port of `NewCommandModal.vue`. */
export function NewCommandDialog({
  trigger,
  triggerLabel,
}: {
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const channelName = commandsStore.useStore((state) => state.channelName)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add new command</DialogTitle>
          <DialogDescription>
            Add new command for channel: #{channelName}
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <NewCommandForm onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

const INITIAL_OPTIONS: CommandOptions = {
  paid: false,
  price: "0",
  errorMessage: DEFAULT_ERROR_MESSAGE,
  timeoutEnabled: false,
  timeout: String(DEFAULT_TIMEOUT),
  timeoutType: ETimeoutType.User,
}

function NewCommandForm({ onDone }: { onDone: () => void }) {
  const channelId = commandsStore.useStore((state) => state.channelId)
  const channelName = commandsStore.useStore((state) => state.channelName)
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState("")
  const [message, setMessage] = useState("")
  const [options, setOptions] = useState(INITIAL_OPTIONS)
  /** Result of the debounced "already exists" check for `name`. */
  const [taken, setTaken] = useState<{ name: string; taken: boolean }>()

  // Same as the Nuxt `watchDebounced(name, checkIfTaken, { debounce: 1000 })`.
  useEffect(() => {
    if (!name) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      void isCommandNameTaken(channelId, { name }).then((result) => {
        if (!cancelled && result.ok) setTaken({ name, taken: result.data })
      })
    }, 1000)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [channelId, name])

  const alreadyExists = !!name && taken?.name === name && taken.taken

  const parsed = SCreateCommand.safeParse({
    name,
    message,
    paid: options.paid,
    ...optionNumbers(options, { price: 0, timeout: DEFAULT_TIMEOUT }),
    errorMessage: options.errorMessage,
    timeoutEnabled: options.timeoutEnabled,
    timeoutType: options.timeoutType,
  })
  const errors = fieldErrors(parsed)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success || alreadyExists) return
    const payload = parsed.data

    startTransition(async () => {
      const result = await createCommand(channelId, payload)
      if (!result.ok) {
        notifyActionError("Error occurred while creating command", result)
        return
      }
      notifySuccess("Command created")
      onDone()
    })
  }

  const nameErrors = alreadyExists
    ? [{ message: "Already exists" }]
    : name !== ""
      ? errors.name
      : undefined

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      {alreadyExists && (
        <Alert variant="destructive">
          <AlertDescription>
            Command: {name} already exists for user: {channelName}
          </AlertDescription>
        </Alert>
      )}
      <FieldGroup>
        <Field data-invalid={!!nameErrors || undefined}>
          <FieldLabel htmlFor="command-name">Command name</FieldLabel>
          <Input
            id="command-name"
            name="name"
            placeholder="name"
            autoComplete="off"
            value={name}
            aria-invalid={!!nameErrors || undefined}
            onChange={(event) => setName(event.target.value)}
          />
          <FieldError errors={nameErrors} />
        </Field>
        <Field data-invalid={(message !== "" && !!errors.message) || undefined}>
          <FieldLabel htmlFor="command-message">Command message</FieldLabel>
          <Textarea
            id="command-message"
            name="message"
            placeholder="message"
            value={message}
            aria-invalid={(message !== "" && !!errors.message) || undefined}
            onChange={(event) => setMessage(event.target.value)}
          />
          {message !== "" && <FieldError errors={errors.message} />}
          <MessagePreview message={message} />
        </Field>
        <CommandOptionsFields
          idPrefix="new-command"
          value={options}
          onChange={(patch) => setOptions((prev) => ({ ...prev, ...patch }))}
          errors={errors}
        />
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button
          type="submit"
          disabled={!parsed.success || alreadyExists || pending}
        >
          {pending && <Spinner data-icon="inline-start" />}
          Add
        </Button>
      </DialogFooter>
    </form>
  )
}
