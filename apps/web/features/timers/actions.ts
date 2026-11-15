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

import { timerSelect } from "./queries"
import { SCreateTimer, SDeleteTimer, SUpdateTimer, type Timer } from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/[channelId]/timers`. Every action takes the
 * channel id the page was rendered for, re-checks access to it, and scopes
 * the write to that channel (`where: { id, channelId }`), so a moderator of
 * one channel can't touch another channel's timers by guessing ids.
 */

const TIMERS_PATH = "/panel/timers"

export async function createTimer(
  channelId: number,
  input: unknown
): Promise<ActionResult<Timer>> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SCreateTimer, input)
  if (!parsed.ok) return parsed

  const created = await tryDb(
    () =>
      prisma.timers.create({
        data: { ...parsed.data, channelId: auth.channel.id },
        select: timerSelect,
      }),
    "Error occurred while creating timer"
  )
  if (!created.ok) return created

  revalidatePath(TIMERS_PATH)
  return ok(created.data)
}

export async function updateTimer(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateTimer, input)
  if (!parsed.ok) return parsed

  const { id, ...data } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.timers.updateMany({
        where: { id, channelId: auth.channel.id },
        data,
      }),
    "Error occurred while updating timer"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Timer not found", 404)

  revalidatePath(TIMERS_PATH)
  return ok()
}

export async function deleteTimer(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteTimer, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () =>
      prisma.timers.deleteMany({
        where: { id: parsed.data.id, channelId: auth.channel.id },
      }),
    "Error occurred while deleting timer"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Timer not found", 404)

  revalidatePath(TIMERS_PATH)
  return ok()
}
