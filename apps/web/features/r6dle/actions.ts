"use server"

import { revalidatePath } from "next/cache"

import {
  authorizeAction,
  fail,
  ok,
  parseInput,
  tryDb,
  type ActionResult,
} from "@/lib/server/action"
import { prisma } from "@/lib/server/db"

import { toOperator } from "./queries"
import {
  SCreateOperator,
  SDeleteOperator,
  SUpdateOperator,
  type R6dleOperator,
} from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/r6dle/operators`. The Nuxt handlers only
 * accept `r6dleadmin` (no admin shortcut); that is kept, with DB-fresh perms
 * instead of the session cookie's. `R6DleOperators` is a global table, so
 * the scope is the perm itself.
 */

const R6DLE_PATH = "/panel/r6dle"
const R6DLE_PERMS = { perms: ["r6dleadmin" as const] }

export async function createR6dleOperator(
  input: unknown
): Promise<ActionResult<R6dleOperator>> {
  const auth = await authorizeAction(R6DLE_PERMS)
  if (!auth.ok) return auth

  const parsed = parseInput(SCreateOperator, input)
  if (!parsed.ok) return parsed

  const { name } = parsed.data
  const existing = await tryDb(() =>
    prisma.r6DleOperators.findUnique({ where: { name }, select: { id: true } })
  )
  if (!existing.ok) return existing
  if (existing.data) {
    return fail(`Operator: '${name}' already exists`, 403)
  }

  const created = await tryDb(
    () =>
      prisma.r6DleOperators.create({
        data: { ...parsed.data, role: parsed.data.role.join(",") },
      }),
    "Error occurred while creating operator"
  )
  if (!created.ok) return created

  revalidatePath(R6DLE_PATH)
  return ok(toOperator(created.data))
}

export async function updateR6dleOperator(
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeAction(R6DLE_PERMS)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateOperator, input)
  if (!parsed.ok) return parsed

  const { id, role, ...rest } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.r6DleOperators.updateMany({
        where: { id },
        data: { ...rest, role: role ? role.join(",") : undefined },
      }),
    "Error occurred while updating operator"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Operator not found", 404)

  revalidatePath(R6DLE_PATH)
  return ok()
}

export async function deleteR6dleOperator(
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeAction(R6DLE_PERMS)
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteOperator, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () => prisma.r6DleOperators.deleteMany({ where: { id: parsed.data.id } }),
    "Error occurred while deleting operator"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Operator not found", 404)

  revalidatePath(R6DLE_PATH)
  return ok()
}
