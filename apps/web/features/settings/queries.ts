import "server-only"

import {
  hasPerms,
  requireChannelAccess,
  requireSession,
} from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import {
  SSettings,
  type AIModelOption,
  type ChannelSettingsResult,
  type TSettings,
} from "./schema"

/**
 * Settings are stored in `WebuiUser.settings` of the user who owns the
 * channel (`WebuiUser.channelId === Channel.id`). The column is JSON, but
 * older rows hold a JSON string, so both forms are accepted.
 */
export function parseStoredSettings(
  stored: unknown
): { ok: true; settings: TSettings } | { ok: false } {
  let raw = stored
  if (typeof stored === "string") {
    try {
      raw = JSON.parse(stored)
    } catch {
      return { ok: false }
    }
  }

  const parsed = SSettings.safeParse(raw)
  return parsed.success ? { ok: true, settings: parsed.data } : { ok: false }
}

/** Port of `GET /api/[channelId]/settings` (any user with access to the channel). */
export async function getChannelSettings(
  channelId: number
): Promise<ChannelSettingsResult> {
  const { channel } = await requireChannelAccess(channelId)

  const owner = await prisma.webuiUser.findFirst({
    where: { channelId: channel.id },
    select: { settings: true },
  })

  if (!owner) {
    return { status: "missing" }
  }

  const parsed = parseStoredSettings(owner.settings)
  return parsed.ok
    ? { status: "ok", settings: parsed.settings }
    : { status: "invalid" }
}

/**
 * The model selector's options: enabled AI models. Port of the read the
 * settings page did through `GET /api/admin/ai-models`, with the same perms
 * rule (`admin` or `ai+`); everyone else gets an empty list, which the page
 * turns into the "current model only" fallback, like Nuxt after its 401.
 */
export async function getAIModelOptions(): Promise<AIModelOption[]> {
  const user = await requireSession()

  if (!hasPerms(user.perms, ["admin", "ai+"])) {
    return []
  }

  return prisma.ollamaAIModels.findMany({
    where: { enabled: true },
    select: { name: true, provider: true },
    orderBy: { id: "asc" },
  })
}
