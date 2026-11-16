import { ETimeoutType } from "bellatrix"
import { z } from "zod"

export { ETimeoutType }

/**
 * Port of `types/commands.type.ts`. Tightened: ids, prices and
 * timeouts must be non-negative integers, `enabled` must be a real boolean
 * (the Nuxt `z.coerce.boolean()` turned "false" into true).
 */
export const SCreateCommand = z.object({
  name: z.string().min(1, "Name can't be empty"),
  message: z.string().min(1, "Message can't be empty"),
  paid: z.boolean(),
  price: z.number().int().min(0),
  errorMessage: z.string(),
  timeout: z.number().int().min(0),
  timeoutEnabled: z.boolean(),
  timeoutType: z.nativeEnum(ETimeoutType),
})

export const SUpdateCommand = z.object({
  id: z.coerce.number().int().positive(),
  enabled: z.boolean().optional(),
  message: z.record(z.string()).optional(),
  alias: z.coerce.string().optional(),
  paid: z.boolean().optional(),
  price: z.number().int().min(0).optional(),
  errorMessage: z.string().optional(),
  timeout: z.number().int().min(0).optional(),
  timeoutEnabled: z.boolean().optional(),
  timeoutType: z.nativeEnum(ETimeoutType).optional(),
})

/**
 * The Nuxt `SUpdateSubCommand` required `paid`, `price` and `errorMessage`,
 * which `EditSubcommand.vue` never sent (always 400) and `SubCommands` has no
 * `errorMessage` column. Only what the edit form exposes is accepted here.
 */
export const SUpdateSubCommand = z.object({
  id: z.coerce.number().int().positive(),
  message: z.record(z.string()).optional(),
  alias: z.coerce.string().optional(),
})

export const SDeleteCommand = z.object({
  id: z.coerce.number().int().positive(),
})

export const SCommandName = z.object({
  name: z.string().min(1),
})

export type TCreateCommand = z.infer<typeof SCreateCommand>
export type TUpdateCommand = z.infer<typeof SUpdateCommand>
export type TUpdateSubCommand = z.infer<typeof SUpdateSubCommand>

/** `{ base: "..." }`, or several keys for commands with variants. */
export type CommandMessage = Record<string, string>

export type SubCommand = {
  id: number
  name: string
  alias: string
  message: CommandMessage
}

/** A command (with its subcommands) as sent to the client. */
export type Command = {
  id: number
  name: string
  enabled: boolean
  message: CommandMessage
  alias: string
  isCore: boolean
  price: number
  paid: boolean
  /** Seconds. */
  timeout: number
  timeoutEnabled: boolean
  timeoutType: ETimeoutType
  errorMessage: string
  subCommands: SubCommand[]
}

export const DEFAULT_ERROR_MESSAGE =
  "You need minimum $points points to run this command!"
export const DEFAULT_TIMEOUT = 30

export const TIMEOUT_TYPE_ITEMS = [
  { value: ETimeoutType.Command, label: "per command" },
  { value: ETimeoutType.User, label: "per user" },
]
