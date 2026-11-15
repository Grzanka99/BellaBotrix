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

import { aiSystemPromptSelect } from "./queries"
import {
  SDeleteAISystemPrompt,
  SMoveAISystemPrompt,
  SUpdateAISystemPrompt,
  type AISystemPrompt,
} from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/admin/ai-system-prompts` (admin only,
 * DB-fresh perms). The table is global, so the scope is "caller is admin".
 * Multi-row changes (reorder, delete + renumber) run in one transaction.
 * No sync-service call: the Nuxt handlers didn't make one either.
 */

const PROMPTS_PATH = "/panel/admin/ai/system-prompts"

/** Port of POST: an empty, disabled prompt appended after the highest order. */
export async function createAISystemPrompt(): Promise<
  ActionResult<AISystemPrompt>
> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const created = await tryDb(
    () =>
      prisma.$transaction(async (tx) => {
        const highest = await tx.ollamaAISetupPrompts.findFirst({
          orderBy: { order: "desc" },
          select: { order: true },
        })
        // Same as Nuxt: a highest order of 0 (falsy) also yields 1.
        const order = highest?.order ? highest.order + 1 : 1

        return tx.ollamaAISetupPrompts.create({
          data: { order, text: "", enabled: false },
          select: aiSystemPromptSelect,
        })
      }),
    "Error occurred while creating prompt"
  )
  if (!created.ok) return created

  revalidatePath(PROMPTS_PATH)
  return ok(created.data)
}

/** Port of PUT without `orderDirection`: edits name / text / enabled. */
export async function updateAISystemPrompt(
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateAISystemPrompt, input)
  if (!parsed.ok) return parsed

  const { id, name, text, enabled } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.ollamaAISetupPrompts.updateMany({
        where: { id },
        data: { name, text, enabled },
      }),
    "Error occurred while updating prompt"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Prompt not found", 404)

  revalidatePath(PROMPTS_PATH)
  return ok()
}

/**
 * Port of PUT with `orderDirection` (`handleWithOrderChange`): the target
 * order is `order - 1` (up) or `order + 1` (down). If a prompt has that
 * order, the two swap their `order` values; otherwise only this prompt's
 * `order` is set to the target.
 */
export async function moveAISystemPrompt(
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SMoveAISystemPrompt, input)
  if (!parsed.ok) return parsed

  const { id, orderDirection } = parsed.data
  const moved = await tryDb(
    () =>
      prisma.$transaction(async (tx) => {
        const all = await tx.ollamaAISetupPrompts.findMany({
          select: { id: true, order: true },
          orderBy: { id: "asc" },
        })
        const thisOne = all.find((prompt) => prompt.id === id)
        if (!thisOne) return false

        const targetOrder =
          orderDirection === "up" ? thisOne.order - 1 : thisOne.order + 1
        const toBeReplaced = all.find((prompt) => prompt.order === targetOrder)

        if (!toBeReplaced) {
          await tx.ollamaAISetupPrompts.update({
            where: { id: thisOne.id },
            data: { order: targetOrder },
          })
          return true
        }

        await tx.ollamaAISetupPrompts.update({
          where: { id: toBeReplaced.id },
          data: { order: thisOne.order },
        })
        await tx.ollamaAISetupPrompts.update({
          where: { id: thisOne.id },
          data: { order: toBeReplaced.order },
        })
        return true
      }),
    "Error occurred while reordering prompts"
  )
  if (!moved.ok) return moved
  if (!moved.data) return fail("Prompt not found", 404)

  revalidatePath(PROMPTS_PATH)
  return ok()
}

/**
 * Port of DELETE: removes the prompt, then (`fixOrder`) decrements the
 * `order` of every prompt that came after it.
 */
export async function deleteAISystemPrompt(
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteAISystemPrompt, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () =>
      prisma.$transaction(async (tx) => {
        const found = await tx.ollamaAISetupPrompts.findUnique({
          where: { id: parsed.data.id },
          select: { id: true, order: true },
        })
        if (!found) return false

        await tx.ollamaAISetupPrompts.delete({ where: { id: found.id } })
        await tx.ollamaAISetupPrompts.updateMany({
          where: { order: { gt: found.order } },
          data: { order: { decrement: 1 } },
        })
        return true
      }),
    "Error occurred while deleting prompt"
  )
  if (!deleted.ok) return deleted
  if (!deleted.data) return fail("Prompt not found", 404)

  revalidatePath(PROMPTS_PATH)
  return ok()
}
