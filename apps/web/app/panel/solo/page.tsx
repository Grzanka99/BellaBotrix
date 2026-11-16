import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { SoloView } from "@/features/solo/components/solo-view"
import { getSolosPage } from "@/features/solo/queries"
import { parseListParams, type RawSearchParams } from "@/lib/list-params"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Solo",
}

export default async function SoloPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const data = await getSolosPage(
    channel.id,
    parseListParams(await searchParams)
  )

  return <SoloView key={channel.id} data={data} />
}
