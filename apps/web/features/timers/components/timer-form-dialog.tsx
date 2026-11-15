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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { createTimer, updateTimer } from "../actions"
import { SCreateTimer, type Timer } from "../schema"
import { timersStore } from "../store"

/**
 * Port of `NewTimerForm.vue` (no `timer`) and `TimerEditForm.vue` (`timer`).
 * `trigger` is the element that opens the dialog (Base UI `render` style).
 */
export function TimerFormDialog({
  timer,
  trigger,
  triggerLabel,
}: {
  timer?: Timer
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{timer ? "Edit timer" : "New timer"}</DialogTitle>
          <DialogDescription>
            The bot posts the message in chat every timeout seconds.
          </DialogDescription>
        </DialogHeader>
        {/* Mounted only while open, so the form starts fresh every time. */}
        <TimerForm timer={timer} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function TimerForm({ timer, onDone }: { timer?: Timer; onDone: () => void }) {
  const channelId = timersStore.useStore((state) => state.channelId)
  const [pending, startTransition] = useTransition()
  const [message, setMessage] = useState(timer?.message ?? "")
  const [timeout, setTimeoutValue] = useState(String(timer?.timeout ?? 1000))

  const parsed = SCreateTimer.safeParse({
    message,
    timeout: timeout === "" ? Number.NaN : timeout,
    enabled: timer?.enabled ?? true,
  })
  const errors = fieldErrors(parsed)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const { message, timeout, enabled } = parsed.data

    startTransition(async () => {
      if (timer) {
        const result = await updateTimer(channelId, {
          id: timer.id,
          message,
          timeout,
        })
        if (!result.ok) {
          notifyActionError("Error occurred while updating timer", result)
          return
        }
        notifySuccess("Timer updated")
      } else {
        const result = await createTimer(channelId, {
          message,
          timeout,
          enabled,
        })
        if (!result.ok) {
          notifyActionError("Error occurred while creating timer", result)
          return
        }
        notifySuccess("Timer created")
      }
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup>
        <Field data-invalid={(message !== "" && !!errors.message) || undefined}>
          <FieldLabel htmlFor="timer-message">Message</FieldLabel>
          <Textarea
            id="timer-message"
            name="message"
            value={message}
            aria-invalid={(message !== "" && !!errors.message) || undefined}
            onChange={(event) => setMessage(event.target.value)}
          />
          {message !== "" && <FieldError errors={errors.message} />}
        </Field>
        <Field data-invalid={!!errors.timeout || undefined}>
          <FieldLabel htmlFor="timer-timeout">
            Timeout (in seconds, set 0 to disable)
          </FieldLabel>
          <Input
            id="timer-timeout"
            name="timeout"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            value={timeout}
            aria-invalid={!!errors.timeout || undefined}
            onChange={(event) => setTimeoutValue(event.target.value)}
          />
          <FieldError errors={errors.timeout} />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {timer ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </form>
  )
}
