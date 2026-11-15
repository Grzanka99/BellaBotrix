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
import { indicateSettingsSync, syncInBackground } from "@/lib/server/sync"

import { mergeSettings } from "./merge"
import { restrictSettingsUpdate } from "./perms"
import { parseStoredSettings } from "./queries"
import { SSettings, SSettingsUpdate, type TSettings } from "./schema"

const SETTINGS_PATH = "/panel/settings"

/**
 * Port of `PUT /api/[channelId]/settings`. Any user with access to the
 * channel may call it; the perms-gated parts of the update (`ollamaAI`,
 * `ollamaAI.model` / `keepHistory`, `automod`) are dropped first for users
 * without the needed perms. The update is deep-merged into the stored
 * settings of the channel owner's `WebuiUser` row, validated again, saved,
 * and the bot is told to reload them (fire-and-forget, like Nuxt).
 * Returns the full merged settings.
 */
export async function updateSettings(
  channelId: number,
  input: unknown
): Promise<ActionResult<TSettings>> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SSettingsUpdate, input)
  if (!parsed.ok) return parsed

  const update = restrictSettingsUpdate(parsed.data, auth.user.perms)

  const owner = await tryDb(
    () =>
      prisma.webuiUser.findFirst({
        where: { channelId: auth.channel.id },
        select: { id: true, settings: true },
      }),
    "Error occurred while updating settings"
  )
  if (!owner.ok) return owner
  if (!owner.data) return fail("This channel has no settings", 404)
  const ownerId = owner.data.id

  const stored = parseStoredSettings(owner.data.settings)
  if (!stored.ok)
    return fail("Stored settings of this channel are invalid", 500)

  const merged = SSettings.safeParse(mergeSettings(stored.settings, update))
  if (!merged.success) return fail("Updated settings are invalid", 500)

  const saved = await tryDb(
    () =>
      prisma.webuiUser.updateMany({
        where: { id: ownerId, channelId: auth.channel.id },
        data: { settings: merged.data },
      }),
    "Error occurred while updating settings"
  )
  if (!saved.ok) return saved
  if (saved.data.count === 0) return fail("This channel has no settings", 404)

  const syncChannelId = auth.channel.id
  syncInBackground("settings sync", () => indicateSettingsSync(syncChannelId))

  revalidatePath(SETTINGS_PATH)
  return ok(merged.data)
}
