"use client"

import { RotateCcwIcon } from "lucide-react"
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { createTriggerWord, updateTriggerWord } from "../actions"
import { SCreateTriggerWord, type TriggerWord } from "../schema"
import { triggerWordsStore } from "../store"

/**
 * Port of `NewTriggerWordForm.vue` (no `triggerWord`) and
 * `TriggerWordsEditForm.vue` (`triggerWord`).
 */
export function TriggerWordFormDialog({
  triggerWord,
  trigger,
  triggerLabel,
}: {
  triggerWord?: TriggerWord
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {triggerWord ? "Edit trigger" : "New trigger words"}
          </DialogTitle>
          <DialogDescription>
            The bot answers with the response when a chat message contains one
            of the triggers.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <TriggerWordForm
          triggerWord={triggerWord}
          onDone={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

function TriggerWordForm({
  triggerWord,
  onDone,
}: {
  triggerWord?: TriggerWord
  onDone: () => void
}) {
  const channelId = triggerWordsStore.useStore((state) => state.channelId)
  const [pending, startTransition] = useTransition()
  const [triggers, setTriggers] = useState(triggerWord?.triggers ?? "")
  const [response, setResponse] = useState(triggerWord?.response ?? "")

  const parsed = SCreateTriggerWord.safeParse({ triggers, response })
  const errors = fieldErrors(parsed)
  // New form: don't shout about empty fields before the user typed anything.
  const touched = {
    triggers: !!triggerWord || triggers !== "",
    response: !!triggerWord || response !== "",
  }

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const payload = parsed.data

    startTransition(async () => {
      if (triggerWord) {
        const result = await updateTriggerWord(channelId, {
          id: triggerWord.id,
          ...payload,
        })
        if (!result.ok) {
          notifyActionError(
            "Error occurred while updating trigger word",
            result
          )
          return
        }
        notifySuccess("Trigger word updated")
      } else {
        const result = await createTriggerWord(channelId, payload)
        if (!result.ok) {
          notifyActionError(
            "Error occurred while creating trigger word",
            result
          )
          return
        }
        notifySuccess("Trigger word created")
      }
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <TextField
          id="trigger-word-triggers"
          label="Triggers"
          value={triggers}
          original={triggerWord?.triggers}
          onChange={setTriggers}
          errors={touched.triggers ? errors.triggers : undefined}
        />
        <TextField
          id="trigger-word-response"
          label="Response"
          value={response}
          original={triggerWord?.response}
          onChange={setResponse}
          errors={touched.response ? errors.response : undefined}
        />
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {triggerWord ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </form>
  )
}

/** Textarea with the Nuxt `FormTextarea :restore` button when editing. */
function TextField({
  id,
  label,
  value,
  original,
  onChange,
  errors,
}: {
  id: string
  label: string
  value: string
  original?: string
  onChange: (value: string) => void
  errors?: { message: string }[]
}) {
  return (
    <Field data-invalid={!!errors || undefined}>
      <div className="flex items-center justify-between gap-2">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {original !== undefined && value !== original && (
          <Button
            type="button"
            variant="ghost"
            size="xs"
            onClick={() => onChange(original)}
          >
            <RotateCcwIcon data-icon="inline-start" />
            Restore
          </Button>
        )}
      </div>
      <Textarea
        id={id}
        value={value}
        aria-invalid={!!errors || undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      <FieldError errors={errors} />
    </Field>
  )
}
