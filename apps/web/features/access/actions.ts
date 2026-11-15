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

import { getOwnChannel } from "./queries"
import { SGrantAccess, SRevokeAccess } from "./schema"

/**
 * Ports of `POST|DELETE /api/channelaccess`. Like Nuxt, any logged-in user
 * may manage access to the channel they OWN (no perms needed); the channel
 * is always `WebuiUser.channelId` from the DB, never client input.
 */

const ACCESS_PATH = "/panel/access"

async function authorizeOwnChannel() {
  const auth = await authorizeAction()
  if (!auth.ok) return auth

  const channel = await tryDb(() => getOwnChannel(auth.user))
  if (!channel.ok) return channel
  if (!channel.data) return fail("You don't have your own channel", 401)

  return { ok: true as const, user: auth.user, channel: channel.data }
}

export async function grantAccess(input: unknown): Promise<ActionResult> {
  const auth = await authorizeOwnChannel()
  if (!auth.ok) return auth

  const parsed = parseInput(SGrantAccess, input)
  if (!parsed.ok) return parsed
  const { username, accessLevel } = parsed.data

  const grantee = await tryDb(
    () =>
      prisma.webuiUser.findUnique({
        where: { username },
        select: { id: true },
      }),
    "Error occurred while granting access"
  )
  if (!grantee.ok) return grantee
  if (!grantee.data) return fail("User not found", 400)
  const userid = grantee.data.id

  const created = await tryDb(async () => {
    // Not in Nuxt: refuse a second row for the same user and channel.
    const existing = await prisma.channelAccess.count({
      where: { userid, channelId: auth.channel.id },
    })
    if (existing > 0) return null

    return prisma.channelAccess.create({
      data: { userid, channelId: auth.channel.id, accessLevel },
      select: { id: true },
    })
  }, "Error occurred while granting access")
  if (!created.ok) return created
  if (!created.data) return fail("This user already has access", 409)

  revalidatePath(ACCESS_PATH)
  return ok()
}

export async function revokeAccess(input: unknown): Promise<ActionResult> {
  const auth = await authorizeOwnChannel()
  if (!auth.ok) return auth

  const parsed = parseInput(SRevokeAccess, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () =>
      prisma.channelAccess.deleteMany({
        where: {
          id: parsed.data.id,
          // Only rows of the caller's own channel...
          channelId: auth.channel.id,
          // ...and never the caller's own access (the Nuxt UI disabled it).
          NOT: { userid: auth.user.id },
        },
      }),
    "Error occurred while revoking access"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Access entry not found", 404)

  revalidatePath(ACCESS_PATH)
  return ok()
}
