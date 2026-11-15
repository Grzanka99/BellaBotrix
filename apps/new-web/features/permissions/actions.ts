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

import { permissionEntrySelect, toPermissionEntry } from "./queries"
import { SUpdatePermissions, type PermissionEntry } from "./schema"

/**
 * Port of `PUT /api/admin/permissions` (the Nuxt DELETE handler is disabled, so there is no delete action). `WebuiUser` is a global
 * table: the scope is "caller is admin" (DB-fresh perms, like the Nuxt
 * `getUserPerms`), there is no channel to scope by.
 */

const PERMISSIONS_PATH = "/panel/admin/permissions"

export async function updatePermissions(
  input: unknown
): Promise<ActionResult<PermissionEntry>> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdatePermissions, input)
  if (!parsed.ok) return parsed

  const { id } = parsed.data
  const newPerms = [...new Set(parsed.data.perms)]

  // Nuxt: an admin can't remove `admin` / `user` from themselves.
  if (auth.user.id === id) {
    if (!newPerms.includes("admin") && auth.user.perms.includes("admin")) {
      newPerms.push("admin")
    }
    if (!newPerms.includes("user") && auth.user.perms.includes("user")) {
      newPerms.push("user")
    }
  }

  const updated = await tryDb(async () => {
    const result = await prisma.webuiUser.updateMany({
      where: { id },
      data: { perms: newPerms.join(",") },
    })
    if (result.count === 0) return null

    const user = await prisma.webuiUser.findUnique({
      where: { id },
      select: permissionEntrySelect,
    })
    if (!user) return null

    const channels = await prisma.channel.findMany({
      where: { id: user.channelId },
      select: { id: true, name: true },
    })
    return toPermissionEntry(user, channels)
  }, "Error occurred while updating permissions")
  if (!updated.ok) return updated
  if (!updated.data) return fail("User not found", 404)

  revalidatePath(PERMISSIONS_PATH)
  return ok(updated.data)
}
