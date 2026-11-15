import "server-only"

import { requireChannelAccess } from "@/lib/server/auth"
import { isLive } from "@/lib/server/sync"

export type LiveStatus = "live" | "offline" | "unknown"

/**
 * Port of `GET /api/[channelId]/islive`. Never throws for sync problems:
 * an unreachable sync service yields "unknown".
 */
export async function getLiveStatus(channelId: number): Promise<LiveStatus> {
  const { channel } = await requireChannelAccess(channelId)

  try {
    return (await isLive(channel.name)) ? "live" : "offline"
  } catch (error) {
    console.warn("[dashboard] islive check failed:", (error as Error).message)
    return "unknown"
  }
}
