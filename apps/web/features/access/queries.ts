import "server-only"

import { requireSession, type CurrentUser } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import type { OwnChannelAccess } from "./schema"

/**
 * The channel the caller owns: `WebuiUser.channelId` re-read from the DB
 * (never the selected channel, never the session cookie copy), or `null`
 * when it doesn't point at an existing channel (`-1` = no own channel).
 */
export async function getOwnChannel(
  user: CurrentUser
): Promise<{ id: number; name: string } | null> {
  if (!Number.isInteger(user.channelId) || user.channelId <= 0) {
    return null
  }

  return prisma.channel.findUnique({
    where: { id: user.channelId },
    select: { id: true, name: true },
  })
}

/**
 * Port of `GET /api/channelaccess`: everyone with access to the caller's own
 * channel. Only ids, usernames and access levels leave the server.
 */
export async function getOwnChannelAccess(): Promise<OwnChannelAccess> {
  const user = await requireSession()
  const channel = await getOwnChannel(user)

  if (!channel) {
    return { channel: null, entries: [] }
  }

  const rows = await prisma.channelAccess.findMany({
    where: { channelId: channel.id },
    select: { id: true, userid: true, accessLevel: true },
    orderBy: { id: "asc" },
  })

  const users = await prisma.webuiUser.findMany({
    where: { id: { in: [...new Set(rows.map((row) => row.userid))] } },
    select: { id: true, username: true },
  })
  const usernames = new Map(users.map((u) => [u.id, u.username]))

  return {
    channel,
    entries: rows.map((row) => ({
      ...row,
      username: usernames.get(row.userid) ?? null,
    })),
  }
}
