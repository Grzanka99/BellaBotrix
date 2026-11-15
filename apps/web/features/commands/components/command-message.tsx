"use client"

import { MessageWithEmotes } from "@/features/emotes/components/message-with-emotes"

import type { CommandMessage as TCommandMessage } from "../schema"

/**
 * Port of `CommandMessage.vue`: a single message shows `base`; several
 * variants show each key with its message.
 */
export function CommandMessage({ message }: { message: TCommandMessage }) {
  const keys = Object.keys(message)

  if (keys.length > 1) {
    return (
      <ul className="flex flex-col gap-2">
        {keys.map((key) => (
          <li key={key} className="flex flex-col gap-0.5">
            <code className="font-mono text-xs font-semibold">{key}</code>
            <MessageWithEmotes message={message[key]} />
          </li>
        ))}
      </ul>
    )
  }

  return <MessageWithEmotes message={message.base ?? message[keys[0]] ?? ""} />
}
