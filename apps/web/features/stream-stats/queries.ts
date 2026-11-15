import "server-only"

import { cache } from "react"

import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"
import { isLive } from "@/lib/server/sync"

import {
  computeStreamData,
  reduceSamples,
  type LiveStatus,
  type MonthSummary,
  type SelectedStreamStats,
  type StatSample,
  type StreamsOverview,
  type StreamSummary,
} from "./schema"

/** `Streams.channel` key, exactly as the Nuxt `stats/*` endpoints build it. */
function streamsChannelKey(channelName: string) {
  return `#${channelName}`
}

/**
 * Port of `GET /api/[channelId]/islive` (same approach as the dashboard):
 * never throws for sync problems, an unreachable sync service is "unknown".
 */
export async function getLiveStatus(channelId: number): Promise<LiveStatus> {
  const { channel } = await requireChannelAccess(channelId)

  try {
    return (await isLive(channel.name)) ? "live" : "offline"
  } catch (error) {
    console.warn(
      "[stream-stats] islive check failed:",
      (error as Error).message
    )
    return "unknown"
  }
}

/**
 * Ports of `GET /api/[channelId]/stats/streams` + every per-item
 * `stats/[streamId]/avg` and `stats/month/[month]` call of the picker, in
 * two queries: the channel's streams and one `groupBy` of viewer sums /
 * counts per stream (both scoped to `Streams.channel = #<name>`).
 *
 * Month average = all samples of streams whose `unique_id` starts with the
 * month (Nuxt `startsWith`), i.e. sum / count over those streams.
 */
async function loadStreamsOverview(
  channelId: number
): Promise<StreamsOverview> {
  const { channel } = await requireChannelAccess(channelId)
  const channelKey = streamsChannelKey(channel.name)

  const [rows, sums] = await Promise.all([
    prisma.streams.findMany({
      where: { channel: channelKey },
      select: {
        id: true,
        unique_id: true,
        started_at: true,
        finished_at: true,
      },
      orderBy: { started_at: "desc" },
    }),
    prisma.streamStats.groupBy({
      by: ["streamId"],
      where: { stream: { channel: channelKey } },
      _sum: { viewers: true },
      _count: { _all: true },
    }),
  ])

  const byStream = new Map(
    sums.map((row) => [
      row.streamId,
      { sum: row._sum.viewers ?? 0, count: row._count._all },
    ])
  )

  const streams: StreamSummary[] = []
  const monthTotals = new Map<string, { sum: number; count: number }>()

  for (const row of rows) {
    const agg = byStream.get(row.id)
    const month = row.started_at.substring(0, 7)
    streams.push({
      id: row.id,
      startedAt: row.started_at,
      month,
      live: !row.finished_at,
      avgViewers: agg && agg.count ? agg.sum / agg.count : null,
    })

    if (!monthTotals.has(month)) monthTotals.set(month, { sum: 0, count: 0 })
    if (agg && row.unique_id.startsWith(month)) {
      const total = monthTotals.get(month)!
      total.sum += agg.sum
      total.count += agg.count
    }
  }

  const months: MonthSummary[] = Array.from(monthTotals, ([month, total]) => ({
    month,
    avgViewers: total.count ? total.sum / total.count : null,
  }))

  return { streams, months }
}

/**
 * Port of `GET /api/[channelId]/stats/[streamId]`. Nuxt looked the stream
 * up by `unique_id` without checking the channel (any logged-in user could
 * read any stream); this only returns stats of a stream whose
 * `Streams.channel` is the authorized channel's key, else `null`.
 */
export async function getSelectedStreamStats(
  channelId: number,
  stream: StreamSummary | undefined
): Promise<SelectedStreamStats | null> {
  const { channel } = await requireChannelAccess(channelId)
  if (!stream) return null

  const owned = await prisma.streams.findFirst({
    where: { id: stream.id, channel: streamsChannelKey(channel.name) },
    select: { id: true },
  })
  if (!owned) return null

  const rows = await prisma.streamStats.findMany({
    where: { streamId: owned.id },
    select: {
      timestamp: true,
      viewers: true,
      messages: true,
      follows: true,
      subscribers: true,
      newChatters: true,
    },
    orderBy: { id: "asc" },
  })

  const samples: StatSample[] = rows.map((row) => ({
    ...row,
    timestamp: Number(row.timestamp),
  }))

  return {
    stream,
    samples: samples.length,
    data: computeStreamData(samples),
    points: reduceSamples(samples),
  }
}

/** Cached per request: the page and the picker slot both need it. */
export const getStreamsOverview = cache(loadStreamsOverview)
