"use client"

import { MessageWithEmotes } from "@/features/emotes/components/message-with-emotes"

/** Live preview of a message being edited, with the channel's 7TV emotes. */
export function MessagePreview({ message }: { message: string }) {
  if (!message.trim()) return null

  return (
    <div className="flex flex-col gap-1 border border-dashed p-2 text-sm">
      <span className="text-xs text-muted-foreground">Preview</span>
      <MessageWithEmotes message={message} />
    </div>
  )
}
