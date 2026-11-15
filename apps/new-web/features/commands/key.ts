import "server-only"

import type { Prisma } from "@prisma/client"

import { ETimeoutType, type CommandMessage } from "./schema"

/** Port of `getUniqueName` (`apps/web/server/utils/command.ts`). */
export function getUniqueName(cmd: string, channel: string): string {
  const ch = channel.startsWith("#") ? channel : `#${channel}`
  return `${cmd}@${ch}`
}

/**
 * `Commands.channelName` / `SubCommands.channelName` key the Nuxt endpoints
 * use: `#<Channel.name>`. Always pass the AUTHORIZED channel's name.
 */
export function commandChannelKey(channelName: string): string {
  return `#${channelName}`
}

/**
 * Port of the Nuxt "FIXME: Fix entries in DB to always be json": many
 * messages are stored as a JSON string holding JSON. Never throws; values
 * that can't be read become `{ base: <raw string> }` / `{}`.
 */
export function parseCommandMessage(
  raw: Prisma.JsonValue | null
): CommandMessage {
  let value: unknown = raw
  if (typeof value === "string") {
    try {
      value = JSON.parse(value)
    } catch {
      return { base: value as string }
    }
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return typeof value === "string" ? { base: value } : {}
  }

  const message: CommandMessage = {}
  for (const [key, text] of Object.entries(value)) {
    if (typeof text === "string") message[key] = text
    else if (text !== null && text !== undefined) message[key] = String(text)
  }
  return message
}

export function parseTimeoutType(raw: string): ETimeoutType {
  return raw === ETimeoutType.Command ? ETimeoutType.Command : ETimeoutType.User
}
