"use client"

import { createContext, useContext, useEffect, useState } from "react"

import { getSevenTvEmotes, type EmoteMap } from "../seven-tv"

const NO_EMOTES: EmoteMap = new Map()

const EmotesContext = createContext<EmoteMap>(NO_EMOTES)

/**
 * Loads the channel's 7TV emotes in the browser (like the Nuxt
 * `7tv-integration.store`) and shares them with `MessageWithEmotes`.
 * `twitchChannelId` is the Twitch user id (`Channel.channel_id`).
 */
export function EmotesProvider({
  twitchChannelId,
  children,
}: {
  twitchChannelId: string
  children: React.ReactNode
}) {
  const [loaded, setLoaded] = useState<{ id: string; emotes: EmoteMap }>()

  useEffect(() => {
    let cancelled = false
    void getSevenTvEmotes(twitchChannelId).then((emotes) => {
      if (!cancelled) setLoaded({ id: twitchChannelId, emotes })
    })
    return () => {
      cancelled = true
    }
  }, [twitchChannelId])

  const emotes =
    loaded && loaded.id === twitchChannelId ? loaded.emotes : NO_EMOTES

  return <EmotesContext value={emotes}>{children}</EmotesContext>
}

export function useEmotes(): EmoteMap {
  return useContext(EmotesContext)
}
