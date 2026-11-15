import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { StreamStatsView } from "@/features/stream-stats/components/stream-stats-view"
import {
  getLiveStatus,
  getSelectedStreamStats,
  getStreamsOverview,
} from "@/features/stream-stats/queries"
import { pickStream, SStreamParam } from "@/features/stream-stats/schema"
import { firstParam, type RawSearchParams } from "@/lib/list-params"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Stream Stats",
}

export default async function StreamStatsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const requested = SStreamParam.parse(firstParam((await searchParams).stream))
  const [overview, liveStatus] = await Promise.all([
    getStreamsOverview(channel.id),
    getLiveStatus(channel.id),
  ])

  // `?stream=` must be one of this channel's streams; default = latest.
  const stream = pickStream(overview, requested)
  const selected = await getSelectedStreamStats(channel.id, stream)

  return (
    <StreamStatsView
      key={channel.id}
      overview={overview}
      liveStatus={liveStatus}
      selected={selected}
      requestedMissing={requested !== undefined && !stream}
    />
  )
}
