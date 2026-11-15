"use client"

import { CpuIcon, PencilIcon, PlusIcon, Trash2Icon } from "lucide-react"
import { useTransition } from "react"

import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog"
import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
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
import { notifyActionError, notifyError, notifySuccess } from "@/lib/notify"

import { deleteAIModel, updateAIModel } from "../actions"
import { AI_MODELS_SYNC_FAILED_STATUS, type AIModel } from "../schema"
import { aiModelsStore, type AIModelsProps } from "../store"
import { ModelFormDialog } from "./model-form-dialog"

/** Port of `pages/panel/admin/ai/models.vue`. */
export function AIModelsView(props: AIModelsProps) {
  // Same cadence as the Nuxt store (models list only, not the OpenRouter list).
  useAutoRefresh(10_000)

  return (
    <aiModelsStore.Provider props={props}>
      <PageHeader
        title="AI Models"
        description="Models the bot's AI commands can use."
      >
        <NewModelButton />
      </PageHeader>
      <AIModelsContent />
    </aiModelsStore.Provider>
  )
}

function NewModelButton() {
  return (
    <ModelFormDialog
      trigger={<Button />}
      triggerLabel={
        <>
          <PlusIcon data-icon="inline-start" />
          Add new model
        </>
      }
    />
  )
}

function AIModelsContent() {
  const models = aiModelsStore.useStore((state) => state.models)

  if (models.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CpuIcon />
          </EmptyMedia>
          <EmptyTitle>No models yet</EmptyTitle>
          <EmptyDescription>
            Add a model so the bot can answer AI commands.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewModelButton />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-20">Enabled</TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Provider</TableHead>
          <TableHead>Description</TableHead>
          <TableHead className="w-48">
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {models.map((model) => (
          <ModelRow key={model.id} model={model} />
        ))}
      </TableBody>
    </Table>
  )
}

function ModelRow({ model }: { model: AIModel }) {
  const patchModel = aiModelsStore.useStore((state) => state.patchModel)
  const [togglePending, startToggle] = useTransition()

  function onEnabledChange(enabled: boolean) {
    patchModel(model.id, { enabled })
    startToggle(async () => {
      const result = await updateAIModel({ id: model.id, enabled })
      if (result.ok) return
      if (result.status === AI_MODELS_SYNC_FAILED_STATUS) {
        notifyError("Model updated with a warning", result.error)
        return
      }
      patchModel(model.id, { enabled: !enabled })
      notifyActionError("Error occurred while updating model", result)
    })
  }

  async function onDelete() {
    const result = await deleteAIModel({ id: model.id })
    if (!result.ok) {
      if (result.status === AI_MODELS_SYNC_FAILED_STATUS) {
        notifyError("Model deleted with a warning", result.error)
        return
      }
      notifyActionError("Error occurred while deleting model", result)
      return false
    }
    notifySuccess("Model deleted")
  }

  return (
    <TableRow>
      <TableCell>
        <Switch
          checked={model.enabled}
          disabled={togglePending}
          onCheckedChange={onEnabledChange}
          aria-label={model.enabled ? "Disable model" : "Enable model"}
        />
      </TableCell>
      <TableCell className="font-medium break-all whitespace-normal">
        {model.name}
      </TableCell>
      <TableCell>
        <Badge variant="secondary">{model.provider}</Badge>
      </TableCell>
      <TableCell className="max-w-0 whitespace-normal">
        <span className="line-clamp-3 break-words">{model.description}</span>
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <ModelFormDialog
            model={model}
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
            title="Delete model?"
            description="The bot will no longer offer this model. This can't be undone."
            onConfirm={onDelete}
          />
        </div>
      </TableCell>
    </TableRow>
  )
}
