import { StreamPicker } from "@/features/stream-stats/components/stream-picker"
import { getStreamsOverview } from "@/features/stream-stats/queries"
import { pickStream, SStreamParam } from "@/features/stream-stats/schema"
import { firstParam, type RawSearchParams } from "@/lib/list-params"
import { getSelectedChannel } from "@/lib/server/auth"

/**
 * The months / streams sidebars of `/panel/stream-stats`, rendered next to
 * the main sidebar on large screens. Smaller screens get the same picker
 * inside the page instead.
 */
export default async function StreamStatsAside({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const channel = await getSelectedChannel()
  if (!channel) {
    return null
  }

  const overview = await getStreamsOverview(channel.id)
  if (overview.streams.length === 0) {
    return null
  }

  const requested = SStreamParam.parse(firstParam((await searchParams).stream))

  return (
    <StreamPicker
      key={channel.id}
      overview={overview}
      selectedId={pickStream(overview, requested)?.id}
      className="sticky top-0 hidden h-svh lg:flex"
    />
  )
}
