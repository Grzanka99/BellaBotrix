import { z } from "zod"

/**
 * Port of `types/trigger-words.type.ts`. Tightened: triggers and
 * response can't be empty, ids must be integers, `enabled` must be a real
 * boolean (the Nuxt `z.coerce.boolean()` turned "false" into true).
 */
export const SCreateTriggerWord = z.object({
  triggers: z.string().min(1, "Triggers can't be empty"),
  response: z.string().min(1, "Response can't be empty"),
})

export const SUpdateTriggerWord = z.object({
  id: z.coerce.number().int().positive(),
  triggers: z.coerce.string().min(1, "Triggers can't be empty").optional(),
  response: z.coerce.string().min(1, "Response can't be empty").optional(),
  enabled: z.boolean().optional(),
})

export const SDeleteTriggerWord = z.object({
  id: z.coerce.number().int().positive(),
})

export type TCreateTriggerWord = z.infer<typeof SCreateTriggerWord>
export type TUpdateTriggerWord = z.infer<typeof SUpdateTriggerWord>

/** A trigger word as sent to the client. */
export type TriggerWord = {
  id: number
  triggers: string
  response: string
  enabled: boolean
}
