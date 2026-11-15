import "server-only"

import { z } from "zod"

import { fail, type ActionFailure } from "@/lib/action-result"
import { hasPerms, type TPerms } from "@/lib/perms"
import {
  getChannelForUser,
  getCurrentUser,
  type ChannelSummary,
  type CurrentUser,
} from "@/lib/server/auth"

export { fail, ok } from "@/lib/action-result"
export type { ActionFailure, ActionResult } from "@/lib/action-result"

/**
 * Guards for Server Actions. Server Actions are public HTTP endpoints, so
 * every action runs, in this order:
 *
 *   1. `authorizeAction()` or `authorizeChannelAction(channelId)`
 *      (authentication + channel access + optional perms)
 *   2. `parseInput(schema, input)` (zod)
 *   3. the DB work inside `tryDb(...)`
 *   4. `revalidatePath(...)`
 *
 * Each guard returns either `{ ok: true, ...value }` or an `ActionFailure`
 * that the action returns unchanged:
 *
 *   const auth = await authorizeChannelAction(channelId)
 *   if (!auth.ok) return auth
 */
type Guarded<T> = ({ ok: true } & T) | ActionFailure

type PermsOption = {
  /** Server semantics (`hasPerms`): any of these, no admin shortcut. */
  perms?: TPerms[]
}

export async function authorizeAction(
  options: PermsOption = {}
): Promise<Guarded<{ user: CurrentUser }>> {
  const user = await getCurrentUser()

  if (!user) {
    return fail("Unauthorized", 401)
  }

  if (options.perms && !hasPerms(user.perms, options.perms)) {
    return fail("You don't have permission to do that", 403)
  }

  return { ok: true, user }
}

/**
 * Authenticates and checks that the caller has a `ChannelAccess` row for
 * `channelId` (a `Channel` DB id sent by the client). Use the returned
 * `channel.id` to scope EVERY query: `where: { id, channelId: channel.id }`.
 */
export async function authorizeChannelAction(
  channelId: unknown,
  options: PermsOption = {}
): Promise<Guarded<{ user: CurrentUser; channel: ChannelSummary }>> {
  const auth = await authorizeAction(options)

  if (!auth.ok) {
    return auth
  }

  const parsedId = z.number().int().positive().safeParse(channelId)
  const channel = parsedId.success
    ? await getChannelForUser(parsedId.data)
    : null

  if (!channel) {
    return fail("You don't have access to this channel", 401)
  }

  return { ok: true, user: auth.user, channel }
}

/** zod validation of untrusted action input. */
export function parseInput<S extends z.ZodTypeAny>(
  schema: S,
  input: unknown
): Guarded<{ data: z.output<S> }> {
  const parsed = schema.safeParse(input)

  if (!parsed.success) {
    return fail("Invalid data", 400)
  }

  return { ok: true, data: parsed.data }
}

/**
 * Runs DB work, turning any thrown error into a generic failure. The real
 * error is logged on the server only, Prisma messages never reach the client.
 */
export async function tryDb<T>(
  work: () => Promise<T>,
  errorMessage = "Something went wrong, try again later"
): Promise<Guarded<{ data: T }>> {
  try {
    return { ok: true, data: await work() }
  } catch (error) {
    console.error(`[action] ${errorMessage}`, error)
    return fail(errorMessage, 500)
  }
}
