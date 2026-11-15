import { z } from "zod"

import { SPerms, type TPerms } from "@/lib/perms"

/** Port of `apps/web/types/permissions.type.ts` (`SPerms` lives in `lib/perms`). */
export const SUpdatePermissions = z.object({
  id: z.number().int().positive(),
  perms: z.array(SPerms),
})

export type TUpdatePermissions = z.infer<typeof SUpdatePermissions>

/** A panel user as sent to the client (never the password, token or settings). */
export type PermissionEntry = {
  id: number
  username: string
  perms: TPerms[]
  /** Name of the user's own channel (`WebuiUser.channelId`), if it exists. */
  channel: string | null
}

/** Options of the Nuxt `EditPermissionsForm.vue`, same order and labels. */
export const PERMISSION_OPTIONS: { value: TPerms; label: string }[] = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "r6dleadmin", label: "R6Dle Admin" },
  { value: "moderator", label: "Moderator" },
  { value: "ai", label: "AI Access" },
  { value: "ai+", label: "AI Access with privileges" },
  { value: "automod", label: "Automod" },
]
