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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"
import { fieldErrors } from "@/lib/form"
import { notifyActionError, notifyError, notifySuccess } from "@/lib/notify"

import { createAIModel, updateAIModel } from "../actions"
import {
  AI_MODELS_SYNC_FAILED_STATUS,
  AI_PROVIDERS,
  SAIProvider,
  SCreateAIModel,
  type AIModel,
  type TAIProvider,
} from "../schema"
import { ModelPicker } from "./model-picker"

/** Port of `NewModelModal.vue` (no `model`) and `EditModelModal.vue` (`model`). */
export function ModelFormDialog({
  model,
  trigger,
  triggerLabel,
}: {
  model?: AIModel
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
            {model ? "Edit model entry" : "New model entry"}
          </DialogTitle>
          <DialogDescription>
            The name is the provider&apos;s model id the bot sends requests to.
          </DialogDescription>
        </DialogHeader>
        <ModelForm model={model} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  )
}

function initialProvider(model?: AIModel): TAIProvider {
  const parsed = SAIProvider.safeParse(model?.provider)
  return parsed.success ? parsed.data : "openrouter"
}

function ModelForm({ model, onDone }: { model?: AIModel; onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [provider, setProvider] = useState<TAIProvider>(() =>
    initialProvider(model)
  )
  const [name, setName] = useState(model?.name ?? "")
  const [description, setDescription] = useState(model?.description ?? "")

  const parsed = SCreateAIModel.safeParse({ name, description, provider })
  const errors = fieldErrors(parsed)

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!parsed.success) return
    const data = parsed.data

    startTransition(async () => {
      const result = model
        ? await updateAIModel({ id: model.id, ...data })
        : await createAIModel(data)
      const action = model ? "updating" : "creating"

      if (!result.ok) {
        if (result.status === AI_MODELS_SYNC_FAILED_STATUS) {
          // Saved in the DB; only the bot notification failed.
          notifyError(
            `Model ${model ? "updated" : "created"} with a warning`,
            result.error
          )
          onDone()
          return
        }
        notifyActionError(`Error occurred while ${action} model`, result)
        return
      }
      notifySuccess(model ? "Model updated" : "Model created")
      onDone()
    })
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6">
      <FieldGroup className="gap-6">
        <Field>
          <FieldLabel htmlFor="ai-model-provider">Provider</FieldLabel>
          <Select
            items={AI_PROVIDERS.map(({ value, label }) => ({ value, label }))}
            value={provider}
            onValueChange={(value) => {
              const next = SAIProvider.safeParse(value)
              if (next.success) setProvider(next.data)
            }}
          >
            <SelectTrigger id="ai-model-provider" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {AI_PROVIDERS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        <ModelPicker
          provider={provider}
          name={name}
          onPick={(picked) => {
            setName(picked.model)
            if (picked.description) setDescription(picked.description)
          }}
        />
        <Field data-invalid={(name !== "" && !!errors.name) || undefined}>
          <FieldLabel htmlFor="ai-model-name">Name (model id)</FieldLabel>
          <Input
            id="ai-model-name"
            name="name"
            value={name}
            autoComplete="off"
            aria-invalid={(name !== "" && !!errors.name) || undefined}
            onChange={(event) => setName(event.target.value)}
          />
          {name !== "" && <FieldError errors={errors.name} />}
        </Field>
        <Field>
          <FieldLabel htmlFor="ai-model-description">Description</FieldLabel>
          <Textarea
            id="ai-model-description"
            name="description"
            className="max-h-48"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Field>
      </FieldGroup>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />} disabled={pending}>
          Cancel
        </DialogClose>
        <Button type="submit" disabled={!parsed.success || pending}>
          {pending && <Spinner data-icon="inline-start" />}
          {model ? "Save" : "Add"}
        </Button>
      </DialogFooter>
    </form>
  )
}
