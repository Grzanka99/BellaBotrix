"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { AISystemPrompt } from "./schema"

/** Port of `store/ai-system-prompts.store.ts` (list sorted by `order` on the server). */

export type AISystemPromptsProps = {
  prompts: AISystemPrompt[]
}

type AISystemPromptsState = {
  prompts: AISystemPrompt[]
  patchPrompt: (id: number, patch: Partial<AISystemPrompt>) => void
}

export const aiSystemPromptsStore = createStoreContext<
  AISystemPromptsState,
  AISystemPromptsProps
>({
  name: "AISystemPromptsStore",
  create: (props) => (set) => ({
    prompts: props.prompts,
    patchPrompt: (id, patch) =>
      set((state) => ({
        prompts: state.prompts.map((prompt) =>
          prompt.id === id ? { ...prompt, ...patch } : prompt
        ),
      })),
  }),
  sync: (props) => ({ prompts: props.prompts }),
})
