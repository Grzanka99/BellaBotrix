"use client"

import { createStoreContext } from "@/lib/create-store-context"

import { getOpenRouterModels } from "./actions"
import type { AIModel, AvailableModel } from "./schema"

/** Port of `store/ai-models.store.ts`. */

export type AIModelsProps = {
  models: AIModel[]
}

/** The OpenRouter list is loaded lazily, once, when a dialog needs it. */
export type OpenRouterList =
  | { status: "idle" | "loading" }
  | { status: "ready"; models: AvailableModel[] }
  | { status: "error"; error: string }

type AIModelsState = {
  models: AIModel[]
  patchModel: (id: number, patch: Partial<AIModel>) => void
  openRouter: OpenRouterList
  loadOpenRouter: () => void
}

export const aiModelsStore = createStoreContext<AIModelsState, AIModelsProps>({
  name: "AIModelsStore",
  create: (props) => (set, get) => ({
    models: props.models,
    patchModel: (id, patch) =>
      set((state) => ({
        models: state.models.map((model) =>
          model.id === id ? { ...model, ...patch } : model
        ),
      })),
    openRouter: { status: "idle" },
    loadOpenRouter: () => {
      const { status } = get().openRouter
      if (status === "loading" || status === "ready") return
      set({ openRouter: { status: "loading" } })
      getOpenRouterModels()
        .then((result) =>
          set({
            openRouter: result.ok
              ? { status: "ready", models: result.data }
              : { status: "error", error: result.error },
          })
        )
        .catch(() =>
          set({
            openRouter: {
              status: "error",
              error: "Could not load the OpenRouter models list",
            },
          })
        )
    },
  }),
  sync: (props) => ({ models: props.models }),
})
