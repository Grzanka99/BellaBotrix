"use client"

import { useEffect } from "react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"

import { GEMINI_MODELS, type AvailableModel, type TAIProvider } from "../schema"
import { aiModelsStore } from "../store"

/**
 * Replaces the Nuxt `SearchSelect`: pick a model id from the provider's
 * list (OpenRouter list fetched lazily on the server, fixed Gemini list).
 * Picking fills the name (and the description when the list has one); the
 * name input stays editable, so manual entry always works.
 */
export function ModelPicker({
  provider,
  name,
  onPick,
}: {
  provider: TAIProvider
  name: string
  onPick: (model: AvailableModel) => void
}) {
  const openRouter = aiModelsStore.useStore((state) => state.openRouter)
  const loadOpenRouter = aiModelsStore.useStore((state) => state.loadOpenRouter)

  useEffect(() => {
    if (provider === "openrouter") loadOpenRouter()
  }, [provider, loadOpenRouter])

  if (provider === "ollama") {
    return null
  }

  if (provider === "openrouter" && openRouter.status !== "ready") {
    if (openRouter.status === "error") {
      return (
        <Alert>
          <AlertDescription>
            {openRouter.error}. Type the model id in the name field instead.
          </AlertDescription>
        </Alert>
      )
    }
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Loading OpenRouter models...
      </div>
    )
  }

  const options =
    provider === "openrouter" && openRouter.status === "ready"
      ? openRouter.models
      : GEMINI_MODELS
  const selected = options.find((option) => option.model === name) ?? null

  return (
    <Field>
      <FieldLabel htmlFor="ai-model-picker">Pick from list</FieldLabel>
      <Combobox
        items={options}
        value={selected}
        onValueChange={(value: AvailableModel | null) => value && onPick(value)}
        itemToStringLabel={(item: AvailableModel) => item.name}
        itemToStringValue={(item: AvailableModel) => item.model}
        isItemEqualToValue={(a: AvailableModel, b: AvailableModel) =>
          a.model === b.model
        }
      >
        <ComboboxInput
          id="ai-model-picker"
          placeholder={`Search ${options.length} models...`}
        />
        <ComboboxContent>
          <ComboboxEmpty>No models found.</ComboboxEmpty>
          <ComboboxList>
            {(item: AvailableModel) => (
              <ComboboxItem key={item.model} value={item}>
                <div className="flex min-w-0 flex-col">
                  <span className="truncate">{item.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {item.model}
                    {item.pricing && ` [ ${item.pricing} ]`}
                  </span>
                </div>
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldDescription>
        Filters by name; picking fills the fields below.
      </FieldDescription>
    </Field>
  )
}
