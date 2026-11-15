import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { TriggerWordsView } from "@/features/trigger-words/components/trigger-words-view"
import { getTriggerWords } from "@/features/trigger-words/queries"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Trigger Words",
}

export default async function TriggerWordsPage() {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const triggerWords = await getTriggerWords(channel.id)

  // `key` remounts the view (fresh store, cleared search) on channel switch.
  return (
    <TriggerWordsView
      key={channel.id}
      channelId={channel.id}
      triggerWords={triggerWords}
    />
  )
}
