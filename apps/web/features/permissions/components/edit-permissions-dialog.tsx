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
import { Spinner } from "@/components/ui/spinner"
import type { TPerms } from "@/lib/perms"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import { updatePermissions } from "../actions"
import { PERMISSION_OPTIONS, type PermissionEntry } from "../schema"
import { permissionsStore } from "../store"
import { CheckboxList } from "./checkbox-list"

/** Port of `EditPermissionsForm.vue`. */
export function EditPermissionsDialog({
  entry,
  trigger,
  triggerLabel,
}: {
  entry: PermissionEntry
  trigger: React.ReactElement
  triggerLabel: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger}>{triggerLabel}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <EditPermissionsForm entry={entry} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function EditPermissionsForm({
  entry,
  onDone,
}: {
  entry: PermissionEntry
  onDone: () => void
}) {
  const replaceEntry = permissionsStore.useStore((state) => state.replaceEntry)
  const [perms, setPerms] = useState<TPerms[]>(entry.perms)
  const [pending, startTransition] = useTransition()

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    startTransition(async () => {
      const result = await updatePermissions({ id: entry.id, perms })
      if (!result.ok) {
        notifyActionError("Error occurred while updating permissions", result)
        return
      }
      replaceEntry(result.data)
      notifySuccess("Permissions updated")
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <DialogHeader>
        <DialogTitle>Edit permissions of user: {entry.username}</DialogTitle>
        <DialogDescription>
          {perms.length > 0 ? perms.join(", ") : "No permissions"}
        </DialogDescription>
      </DialogHeader>
      <CheckboxList
        id={`perms-${entry.id}`}
        legend="Permissions"
        options={PERMISSION_OPTIONS}
        value={perms}
        onChange={setPerms}
      />
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
