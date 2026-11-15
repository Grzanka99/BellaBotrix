import { z } from "zod"

/**
 * Port of the system prompt half of `apps/web/types/ai-settings.type.ts`.
 * Tightened: the id is a positive integer. The Nuxt PUT handler used one
 * DTO for edits and for reordering; it is split into two actions here, with
 * the same semantics (an `orderDirection` request touched nothing else).
 */
export const SUpdateAISystemPrompt = z.object({
  id: z.number().int().positive(),
  name: z.string().optional(),
  text: z.string().optional(),
  enabled: z.boolean().optional(),
})

export const SMoveAISystemPrompt = z.object({
  id: z.number().int().positive(),
  orderDirection: z.union([z.literal("up"), z.literal("down")]),
})

export const SDeleteAISystemPrompt = z.object({
  id: z.coerce.number().int().positive(),
})

/** A row of `OllamaAISetupPrompts` as sent to the client. */
export type AISystemPrompt = {
  id: number
  name: string | null
  text: string
  enabled: boolean
  order: number
}
