"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { useTransition } from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { deleteTimer, updateTimer } from "../actions"
import type { Timer } from "../schema"
import { filterTimers, timersStore } from "../store"
import { TimerFormDialog } from "./timer-form-dialog"

export function TimersTable() {
  const timers = timersStore.useStore((state) => state.timers)
  const query = timersStore.useStore((state) => state.query)
  const filtered = filterTimers(timers, query)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Enabled</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="w-28 text-right">Timeout (s)</TableHead>
          <TableHead className="w-48">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((timer) => (
          <TimerRow key={timer.id} timer={timer} />
        ))}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-24 text-center text-muted-foreground"
            >
              No timers match &quot;{query}&quot;
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function TimerRow({ timer }: { timer: Timer }) {
  const channelId = timersStore.useStore((state) => state.channelId)
  const patchTimer = timersStore.useStore((state) => state.patchTimer)
  const [togglePending, startToggle] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchTimer(timer.id, { enabled })
    startToggle(async () => {
      const result = await updateTimer(channelId, { id: timer.id, enabled })
      if (!result.ok) {
        patchTimer(timer.id, { enabled: !enabled })
        notifyActionError("Error occurred while updating timer", result)
      }
    })
  }

  async function onDelete() {
    const result = await deleteTimer(channelId, { id: timer.id })
    if (!result.ok) {
      notifyActionError("Error occurred while deleting timer", result)
      return false
    }
    notifySuccess("Timer deleted")
  }

  return (
    <TableRow>
      <TableCell>
        <Switch
          checked={timer.enabled}
          disabled={togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={timer.enabled ? "Disable timer" : "Enable timer"}
        />
      </TableCell>
      <TableCell className="max-w-0 whitespace-normal">
        <span className="line-clamp-3 break-words">{timer.message}</span>
      </TableCell>
      <TableCell className="text-right tabular-nums">{timer.timeout}</TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <TimerFormDialog
            timer={timer}
            trigger={<Button variant="outline" size="sm" />}
            triggerLabel={
              <>
                <PencilIcon data-icon="inline-start" />
                Edit
              </>
            }
          />
          <ConfirmDeleteDialog
            trigger={<Button variant="destructive" size="sm" />}
            triggerLabel={
              <>
                <Trash2Icon data-icon="inline-start" />
                Delete
              </>
            }
            title="Delete timer?"
            description="The bot will stop posting this message. This can't be undone."
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
