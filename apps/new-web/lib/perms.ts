import { z } from "zod"

/** Port of `apps/web/types/permissions.type.ts`. Safe to import anywhere. */
export const SPerms = z.union([
  z.literal("user"),
  z.literal("moderator"),
  z.literal("r6dleadmin"),
  z.literal("admin"),
  z.literal("ai"),
  z.literal("ai+"),
  z.literal("automod"),
])

export type TPerms = z.infer<typeof SPerms>

/** Parses the comma separated `WebuiUser.perms` column, dropping unknown values. */
export function parsePerms(raw: string): TPerms[] {
  return raw
    .split(",")
    .map((perm) => perm.trim())
    .filter((perm): perm is TPerms => SPerms.safeParse(perm).success)
}

/**
 * SERVER semantics (port of `checkPerms` in `apps/web/server/utils/perms.ts`):
 * true when the user has ANY of the required perms. There is NO admin
 * shortcut and an empty `required` list never passes.
 * Use this in queries and actions.
 */
export function hasPerms(userPerms: TPerms[], required: TPerms[]): boolean {
  return required.some((perm) => userPerms.includes(perm))
}

/**
 * UI semantics (port of `RequirePerms.server.vue`): admins always pass,
 * otherwise ANY of the required perms passes, and an empty `required` list
 * means "admin only".
 * Use this only to decide what to render; it is not a security boundary.
 */
export function canSeeWithPerms(
  userPerms: TPerms[],
  required: TPerms[]
): boolean {
  if (userPerms.includes("admin")) {
    return true
  }

  return hasPerms(userPerms, required)
}
