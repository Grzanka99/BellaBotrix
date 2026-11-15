"use client"

import {
  ArrowDownIcon,
  ArrowUpIcon,
  BrainCircuitIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import { useTransition } from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { notifyActionError, notifySuccess } from "@/lib/notify"

import {
  createAISystemPrompt,
  deleteAISystemPrompt,
  moveAISystemPrompt,
  updateAISystemPrompt,
} from "../actions"
import type { AISystemPrompt } from "../schema"
import { aiSystemPromptsStore, type AISystemPromptsProps } from "../store"
import { EditPromptDialog } from "./edit-prompt-dialog"

/** Port of `pages/panel/admin/ai/system-prompts.vue`. */
export function AISystemPromptsView(props: AISystemPromptsProps) {
  // Same cadence as the Nuxt store.
  useAutoRefresh(10_000)

  return (
    <aiSystemPromptsStore.Provider props={props}>
      <PageHeader
        title="AI System Prompts"
        description="Setup prompts sent to the AI model, top to bottom."
      >
        <NewPromptButton />
      </PageHeader>
      <PromptsContent />
    </aiSystemPromptsStore.Provider>
  )
}

/** Like Nuxt: creates an empty, disabled prompt at the end right away. */
function NewPromptButton() {
  const [pending, startTransition] = useTransition()

  function onClick() {
    startTransition(async () => {
      const result = await createAISystemPrompt()
      if (!result.ok) {
        notifyActionError("Error occurred while creating prompt", result)
        return
      }
      notifySuccess(
        "Prompt created",
        "Edit it to add its text, then enable it."
      )
    })
  }

  return (
    <Button onClick={onClick} disabled={pending}>
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <PlusIcon data-icon="inline-start" />
      )}
      Add new prompt
    </Button>
  )
}

function PromptsContent() {
  const prompts = aiSystemPromptsStore.useStore((state) => state.prompts)

  if (prompts.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <BrainCircuitIcon />
          </EmptyMedia>
          <EmptyTitle>No system prompts yet</EmptyTitle>
          <EmptyDescription>
            Add a prompt to shape how the AI answers.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewPromptButton />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Enabled</TableHead>
          <TableHead className="w-48">Name</TableHead>
          <TableHead>Text</TableHead>
          <TableHead className="w-24">Order</TableHead>
          <TableHead className="w-48">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {prompts.map((prompt, index) => (
          <PromptRow
            key={prompt.id}
            prompt={prompt}
            isFirst={index === 0}
            isLast={index === prompts.length - 1}
          />
        ))}
      </TableBody>
    </Table>
  )
}

function PromptRow({
  prompt,
  isFirst,
  isLast,
}: {
  prompt: AISystemPrompt
  isFirst: boolean
  isLast: boolean
}) {
  const patchPrompt = aiSystemPromptsStore.useStore(
    (state) => state.patchPrompt
  )
  const [togglePending, startToggle] = useTransition()
  const [movePending, startMove] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchPrompt(prompt.id, { enabled })
    startToggle(async () => {
      const result = await updateAISystemPrompt({ id: prompt.id, enabled })
      if (!result.ok) {
        patchPrompt(prompt.id, { enabled: !enabled })
        notifyActionError("Error occurred while updating prompt", result)
      }
    })
  }

  function onMove(orderDirection: "up" | "down") {
    startMove(async () => {
      const result = await moveAISystemPrompt({ id: prompt.id, orderDirection })
      if (!result.ok) {
        notifyActionError("Error occurred while reordering prompts", result)
      }
    })
  }

  async function onDelete() {
    const result = await deleteAISystemPrompt({ id: prompt.id })
    if (!result.ok) {
      notifyActionError("Error occurred while deleting prompt", result)
      return false
    }
    notifySuccess("Prompt deleted")
  }

  return (
    <TableRow>
      <TableCell>
        <Switch
          checked={prompt.enabled}
          disabled={togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={prompt.enabled ? "Disable prompt" : "Enable prompt"}
        />
      </TableCell>
      <TableCell className="font-medium whitespace-normal">
        {prompt.name || <span className="text-muted-foreground">-</span>}
      </TableCell>
      <TableCell className="max-w-0 whitespace-normal">
        {prompt.text ? (
          <span className="line-clamp-3 break-words">{prompt.text}</span>
        ) : (
          <span className="text-muted-foreground">Empty</span>
        )}
      </TableCell>
      <TableCell>
        <ButtonGroup aria-label="Change order">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Move up"
            disabled={isFirst || movePending}
            onClick={() => onMove("up")}
          >
            <ArrowUpIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Move down"
            disabled={isLast || movePending}
            onClick={() => onMove("down")}
          >
            <ArrowDownIcon />
          </Button>
        </ButtonGroup>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <EditPromptDialog
            prompt={prompt}
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
            title="Delete prompt?"
            description="The prompts after it move up one place. This can't be undone."
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
