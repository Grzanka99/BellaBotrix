import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { AutomodEventsView } from "@/features/automod-events/components/automod-events-view"
import { getAutomodEventsPage } from "@/features/automod-events/queries"
import { parseListParams, type RawSearchParams } from "@/lib/list-params"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Automod Events",
}

export default async function AutomodEventsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const data = await getAutomodEventsPage(
    channel.id,
    parseListParams(await searchParams)
  )

  return <AutomodEventsView key={channel.id} data={data} />
}
