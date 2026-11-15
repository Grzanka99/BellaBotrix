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
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { updateAISystemPrompt } from "../actions"
import type { AISystemPrompt } from "../schema"

/** Port of `EditSystemPrompt.vue`. */
export function EditPromptDialog({
  prompt,
  trigger,
  triggerLabel,
}: {
  prompt: AISystemPrompt
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit system prompt</DialogTitle>
          <DialogDescription>
            Enabled prompts are sent to the model in this list&apos;s order.
          </DialogDescription>
        </DialogHeader>
        <EditPromptForm prompt={prompt} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditPromptForm({
  prompt,
  onDone,
}: {
  prompt: AISystemPrompt
  onDone: () => void
}) {
  const [pending, startTransition] = useTransition()
  const [name, setName] = useState(prompt.name ?? "")
  const [text, setText] = useState(prompt.text)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updateAISystemPrompt({ id: prompt.id, name, text })
      if (!result.ok) {
        notifyActionError("Error occurred while updating prompt", result)
        return
      }
      notifySuccess("Prompt updated")
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="prompt-name">Name</FieldLabel>
          <Input
            id="prompt-name"
            name="name"
            value={name}
            autoComplete="off"
            onChange={(event) => setName(event.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="prompt-text">Text</FieldLabel>
          <Textarea
            id="prompt-text"
            name="text"
            className="max-h-[50vh] min-h-48"
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={pending}>
          {pending && <Spinner data-icon="inline-start" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  )
}
