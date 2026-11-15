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

import { chattersChannelKey } from "./queries"
import { SUpdateChatter } from "./schema"

/**
 * Port of `PUT /api/[channelId]/users`. Nuxt updated `User` by bare id (any
 * chatter of any channel); this scopes the write to the authorized channel's
 * `User.channel` key (`#<name>`, same key the list uses).
 */
export async function updateChatter(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateChatter, input)
  if (!parsed.ok) return parsed

  const { id, isBot } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.user.updateMany({
        where: { id, channel: chattersChannelKey(auth.channel.name) },
        data: { isBot },
      }),
    "Error occurred while updating user"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("User not found", 404)

  revalidatePath("/panel/users")
  return ok()
}
