import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { CommandsView } from "@/features/commands/components/commands-view"
import { getCommands } from "@/features/commands/queries"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Commands",
}

export default async function CommandsPage() {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const commands = await getCommands(channel.id)

  // `key` remounts the view (fresh store, cleared search) on channel switch.
  return (
    <CommandsView
      key={channel.id}
      channelId={channel.id}
      channelName={channel.name}
      twitchChannelId={channel.channel_id}
      commands={commands}
    />
  )
}
