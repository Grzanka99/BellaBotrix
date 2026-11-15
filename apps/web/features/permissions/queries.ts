import "server-only"

import { parsePerms } from "@/lib/perms"
import { prisma } from "@/lib/server/db"

import { getUserWithPerms } from "./guard"
import type { PermissionEntry } from "./schema"

/** Never select more: `password`, `token` and `settings` must not leave the server. */
export const permissionEntrySelect = {
  id: true,
  username: true,
  perms: true,
  channelId: true,
} as const

type RawEntry = {
  id: number
  username: string
  perms: string
  channelId: number
}

/** Shapes a `WebuiUser` row like the Nuxt handlers (channel name via `channelId`). */
export function toPermissionEntry(
  user: RawEntry,
  channels: { id: number; name: string }[]
): PermissionEntry {
  return {
    id: user.id,
    username: user.username,
    perms: parsePerms(user.perms),
    channel:
      channels.find((channel) => channel.id === user.channelId)?.name ?? null,
  }
}

/**
 * Port of `GET /api/admin/permissions` (admin only). `null` = no permission
 * (nothing is read).
 */
export async function getPermissionEntries(): Promise<
  PermissionEntry[] | null
> {
  const user = await getUserWithPerms(["admin"])
  if (!user) return null

  const [users, channels] = await Promise.all([
    prisma.webuiUser.findMany({
      select: permissionEntrySelect,
      orderBy: { id: "asc" },
    }),
    prisma.channel.findMany({ select: { id: true, name: true } }),
  ])

  return users.map((entry) => toPermissionEntry(entry, channels))
}
