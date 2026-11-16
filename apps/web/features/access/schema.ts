import { EChannelAccessLevel } from "bellatrix"
import { z } from "zod"

export { EChannelAccessLevel }

/** Access levels in the order the Nuxt `ChaccForm` offered them (Mod is the default). */
export const ACCESS_LEVELS: EChannelAccessLevel[] = [
  EChannelAccessLevel.Mod,
  EChannelAccessLevel.Owner,
  EChannelAccessLevel.Editor,
  EChannelAccessLevel.Viewer,
]

/** Port of the `POST /api/channelaccess` body. */
export const SGrantAccess = z.object({
  username: z.string().trim().min(1, "Username can't be empty"),
  accessLevel: z.nativeEnum(EChannelAccessLevel),
})

/**
 * Revoke one `ChannelAccess` row of the caller's own channel. Nuxt sent the
 * grantee's user id; the row id is used here (still scoped to the channel).
 */
export const SRevokeAccess = z.object({
  id: z.coerce.number().int().positive(),
})

export type TGrantAccess = z.infer<typeof SGrantAccess>

/** One row of the access table as sent to the client. */
export type ChannelAccessEntry = {
  /** `ChannelAccess.id` */
  id: number
  userid: number
  /** `null` when the panel account no longer exists. */
  username: string | null
  accessLevel: string
}

/** The caller's own channel, or `null` when they don't own one. */
export type OwnChannelAccess = {
  channel: { id: number; name: string } | null
  entries: ChannelAccessEntry[]
}
