"use client"

import { cn } from "@/lib/utils"

import { splitMessage } from "../seven-tv"
import { useEmotes } from "./emotes-provider"

/**
 * Port of `components/commands/MessageWithEmotes.vue`: words that are 7TV
 * emote names of the channel render as the emote image, the rest as text.
 * Image URLs come from `emoteImageUrl` (7TV CDN, https only); everything is
 * rendered as React text/attributes, never as HTML.
 */
export function MessageWithEmotes({
  message,
  className,
}: {
  message: string
  className?: string
}) {
  const emotes = useEmotes()
  const parts = splitMessage(message, emotes)

  return (
    <span className={cn("break-words whitespace-pre-wrap", className)}>
      {parts.map((part, index) =>
        part.kind === "emote" ? (
          // 7TV CDN images; next/image would need a remotePatterns entry.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={index}
            src={part.src}
            alt={part.name}
            title={part.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="mx-0.5 inline-block h-7 w-auto align-middle"
          />
        ) : (
          <span key={index}>
            {part.text}
            {index < parts.length - 1 ? " " : null}
          </span>
        )
      )}
    </span>
  )
}
