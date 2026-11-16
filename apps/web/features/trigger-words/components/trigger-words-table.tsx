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

import { deleteTriggerWord, updateTriggerWord } from "../actions"
import type { TriggerWord } from "../schema"
import { filterTriggerWords, triggerWordsStore } from "../store"
import { TriggerWordFormDialog } from "./trigger-word-form-dialog"

export function TriggerWordsTable() {
  const triggerWords = triggerWordsStore.useStore((state) => state.triggerWords)
  const query = triggerWordsStore.useStore((state) => state.query)
  const filtered = filterTriggerWords(triggerWords, query)

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Enabled</TableHead>
          <TableHead>Triggers</TableHead>
          <TableHead>Response</TableHead>
          <TableHead className="w-48">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((word) => (
          <TriggerWordRow key={word.id} triggerWord={word} />
        ))}
        {filtered.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-24 text-center text-muted-foreground"
            >
              No trigger words match &quot;{query}&quot;
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function TriggerWordRow({ triggerWord }: { triggerWord: TriggerWord }) {
  const channelId = triggerWordsStore.useStore((state) => state.channelId)
  const patchTriggerWord = triggerWordsStore.useStore(
    (state) => state.patchTriggerWord
  )
  const [togglePending, startToggle] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchTriggerWord(triggerWord.id, { enabled })
    startToggle(async () => {
      const result = await updateTriggerWord(channelId, {
        id: triggerWord.id,
        enabled,
      })
      if (!result.ok) {
        patchTriggerWord(triggerWord.id, { enabled: !enabled })
        notifyActionError("Error occurred while updating trigger word", result)
      }
    })
  }

  async function onDelete() {
    const result = await deleteTriggerWord(channelId, { id: triggerWord.id })
    if (!result.ok) {
      notifyActionError("Error occurred while deleting trigger word", result)
      return false
    }
    notifySuccess("Trigger word deleted")
  }

  return (
    <TableRow>
      <TableCell>
        <Switch
          checked={triggerWord.enabled}
          disabled={togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={
            triggerWord.enabled ? "Disable trigger word" : "Enable trigger word"
          }
        />
      </TableCell>
      <TableCell className="max-w-0 min-w-64 whitespace-normal">
        <span className="line-clamp-3 break-words">{triggerWord.triggers}</span>
      </TableCell>
      <TableCell className="max-w-0 min-w-64 whitespace-normal">
        <span className="line-clamp-3 break-words">{triggerWord.response}</span>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <TriggerWordFormDialog
            triggerWord={triggerWord}
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
            title="Delete trigger word?"
            description="The bot will stop answering these triggers. This can't be undone."
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
