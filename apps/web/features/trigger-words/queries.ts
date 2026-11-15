import "server-only"

import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import type { TriggerWord } from "./schema"

/** Columns sent to the client (never select more than the UI needs). */
export const triggerWordSelect = {
  id: true,
  triggers: true,
  response: true,
  enabled: true,
} as const

/** Port of `GET /api/[channelId]/trigger-words` (session + channel access). */
export async function getTriggerWords(
  channelId: number
): Promise<TriggerWord[]> {
  const { channel } = await requireChannelAccess(channelId)

  return prisma.triggerWords.findMany({
    where: { channelId: channel.id },
    select: triggerWordSelect,
    orderBy: { id: "asc" },
  })
}
