import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { TimersView } from "@/features/timers/components/timers-view"
import { getTimers } from "@/features/timers/queries"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Timers",
}

export default async function TimersPage() {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const timers = await getTimers(channel.id)

  // `key` remounts the view (fresh store, cleared search) on channel switch.
  return <TimersView key={channel.id} channelId={channel.id} timers={timers} />
}
