"use server"

import { revalidatePath } from "next/cache"

import {
  authorizeChannelAction,
  fail,
  ok,
  parseInput,
  tryDb,
  type ActionResult,
} from "@/lib/server/action"
import { prisma } from "@/lib/server/db"

import { triggerWordSelect } from "./queries"
import {
  SCreateTriggerWord,
  SDeleteTriggerWord,
  SUpdateTriggerWord,
  type TriggerWord,
} from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/[channelId]/trigger-words`. Any user with
 * access to the channel (no perms, like Nuxt); every write is scoped to the
 * authorized channel (`where: { id, channelId }`), never by bare id. No
 * sync-service calls in the Nuxt endpoints, none here.
 */

const TRIGGER_WORDS_PATH = "/panel/trigger-words"

export async function createTriggerWord(
  channelId: number,
  input: unknown
): Promise<ActionResult<TriggerWord>> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SCreateTriggerWord, input)
  if (!parsed.ok) return parsed

  const created = await tryDb(
    () =>
      prisma.triggerWords.create({
        data: { ...parsed.data, channelId: auth.channel.id, enabled: true },
        select: triggerWordSelect,
      }),
    "Error occurred while creating trigger word"
  )
  if (!created.ok) return created

  revalidatePath(TRIGGER_WORDS_PATH)
  return ok(created.data)
}

export async function updateTriggerWord(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateTriggerWord, input)
  if (!parsed.ok) return parsed

  const { id, ...data } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.triggerWords.updateMany({
        where: { id, channelId: auth.channel.id },
        data,
      }),
    "Error occurred while updating trigger word"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Trigger word not found", 404)

  revalidatePath(TRIGGER_WORDS_PATH)
  return ok()
}

export async function deleteTriggerWord(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteTriggerWord, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () =>
      prisma.triggerWords.deleteMany({
        where: { id: parsed.data.id, channelId: auth.channel.id },
      }),
    "Error occurred while deleting trigger word"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Trigger word not found", 404)

  revalidatePath(TRIGGER_WORDS_PATH)
  return ok()
}
