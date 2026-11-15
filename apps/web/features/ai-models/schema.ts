import { z } from "zod"

/**
 * Port of the AI model half of `types/ai-settings.type.ts`.
 * Tightened: ids are positive integers, a model needs a non-empty name and
 * the provider is one of the three the Nuxt modals offer.
 */
export const AI_PROVIDERS = [
  { value: "openrouter", label: "OpenRouter" },
  { value: "gemini", label: "Google Gemini" },
  { value: "ollama", label: "Ollama" },
] as const

export const SAIProvider = z.enum(["openrouter", "gemini", "ollama"])
export type TAIProvider = z.infer<typeof SAIProvider>

export const SCreateAIModel = z.object({
  name: z.string().trim().min(1, "Name can't be empty"),
  description: z.string(),
  provider: SAIProvider,
})

export const SUpdateAIModel = z.object({
  id: z.number().int().positive(),
  name: z.string().trim().min(1, "Name can't be empty").optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  provider: SAIProvider.optional(),
})

export const SDeleteAIModel = z.object({
  id: z.coerce.number().int().positive(),
})

/** A row of `OllamaAIModels` as sent to the client. */
export type AIModel = {
  id: number
  name: string
  description: string
  provider: string
  enabled: boolean
}

/** Port of `TAvailableModel`: an entry of the OpenRouter models list. */
export type AvailableModel = {
  name: string
  model: string
  description: string
  contextLength: number | null
  pricing: string
}

/** Fixed options of the Nuxt modals for the Gemini provider. */
export const GEMINI_MODELS: AvailableModel[] = [
  {
    name: "Gemini 2.0 Flash",
    model: "gemini-2.0-flash",
    description: "",
    contextLength: null,
    pricing: "",
  },
]

/**
 * Status of a failed AI model mutation whose DB write DID happen but the
 * awaited `indicateAIModelsSync()` failed afterwards (Nuxt answered 500).
 * The client must not roll back optimistic state for it.
 */
export const AI_MODELS_SYNC_FAILED_STATUS = 502
