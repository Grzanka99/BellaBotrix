"use client"

import { PencilIcon, Trash2Icon } from "lucide-react"
import { useTransition } from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { Badge } from "@/components/ui/badge"
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

import { deleteCommand, updateCommand } from "../actions"
import type { Command } from "../schema"
import { commandsStore, filterCommands } from "../store"
import { CommandMessage } from "./command-message"
import { EditCommandDialog } from "./edit-command-dialog"

/** Port of `CommandsList.vue`. */
export function CommandsTable() {
  const commands = commandsStore.useStore((state) => state.commands)
  const query = commandsStore.useStore((state) => state.query)
  const filtered = filterCommands(commands, query)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Enabled</TableHead>
          <TableHead className="w-40">Name</TableHead>
          <TableHead className="w-28">Price</TableHead>
          <TableHead>Message</TableHead>
          <TableHead className="w-40">Aliases</TableHead>
          <TableHead className="w-48">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((command) => (
          <CommandRow key={command.id} command={command} />
        ))}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={6}
              className="h-24 text-center text-muted-foreground"
            >
              Found 0 commands
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function CommandRow({ command }: { command: Command }) {
  const channelId = commandsStore.useStore((state) => state.channelId)
  const patchCommand = commandsStore.useStore((state) => state.patchCommand)
  const [togglePending, startToggle] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchCommand(command.id, { enabled })
    startToggle(async () => {
      const result = await updateCommand(channelId, { id: command.id, enabled })
      if (!result.ok) {
        patchCommand(command.id, { enabled: !enabled })
        notifyActionError("Error occurred while updating command", result)
      }
    })
  }

  async function onDelete() {
    const result = await deleteCommand(channelId, { id: command.id })
    if (!result.ok) {
      notifyActionError("Error occured while deleting command", result)
      return false
    }
    notifySuccess("Command deleted")
  }

  return (
    <TableRow>
      <TableCell className="align-top">
        <Switch
          checked={command.enabled}
          disabled={togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={
            command.enabled
              ? `Disable command ${command.name}`
              : `Enable command ${command.name}`
          }
        />
      </TableCell>
      <TableCell className="align-top whitespace-normal">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="font-medium break-all">{command.name}</span>
          {command.subCommands.length > 0 && (
            <Badge variant="secondary">{command.subCommands.length} sub.</Badge>
          )}
        </div>
      </TableCell>
      <TableCell className="align-top">
        {command.paid ? `${command.price} points` : "free"}
      </TableCell>
      <TableCell className="max-w-0 align-top whitespace-normal">
        <CommandMessage message={command.message} />
      </TableCell>
      <TableCell className="align-top break-all whitespace-normal">
        {command.alias}
      </TableCell>
      <TableCell className="align-top">
        <div className="flex justify-end gap-2">
          <EditCommandDialog
            command={command}
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
            title={`Delete command ${command.name}?`}
            description="The bot will stop answering this command. This can't be undone."
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
