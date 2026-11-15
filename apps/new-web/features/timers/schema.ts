import { z } from "zod"

/**
 * Port of `apps/web/types/timers.type.ts`. Tightened: ids and timeouts must
 * be integers (the DB columns are Int) and an edited message can't be empty.
 */
export const SUpdateTimer = z.object({
  id: z.coerce.number().int().positive(),
  message: z.coerce.string().min(1, "Message can't be empty").optional(),
  timeout: z.coerce.number().int().min(0).optional(),
  enabled: z.boolean().optional(),
})

export const SCreateTimer = z.object({
  message: z.coerce.string().min(1, "Message can't be empty"),
  timeout: z.coerce.number().int().min(0),
  enabled: z.boolean(),
})

export const SDeleteTimer = z.object({
  id: z.coerce.number().int().positive(),
})

export type TUpdateTimer = z.infer<typeof SUpdateTimer>
export type TCreateTimer = z.infer<typeof SCreateTimer>

/** A timer as sent to the client. */
export type Timer = {
  id: number
  message: string
  /** Seconds between messages, 0 disables. */
  timeout: number
  enabled: boolean
}
