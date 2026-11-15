import "server-only"

import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import type { Timer } from "./schema"

/** Columns sent to the client (never select more than the UI needs). */
export const timerSelect = {
  id: true,
  message: true,
  timeout: true,
  enabled: true,
} as const

/** Port of `GET /api/[channelId]/timers`. */
export async function getTimers(channelId: number): Promise<Timer[]> {
  const { channel } = await requireChannelAccess(channelId)

  return prisma.timers.findMany({
    where: { channelId: channel.id },
    select: timerSelect,
    orderBy: { id: "asc" },
  })
}
