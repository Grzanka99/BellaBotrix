import "server-only"

import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import { commandChannelKey, parseCommandMessage, parseTimeoutType } from "./key"
import type { Command } from "./schema"

/**
 * Port of `GET /api/[channelId]/commands` + `GET .../commands/subcommands`
 * joined like `commands.store.ts` (`sub.parentCommand === cmd.uniqueName`).
 * Any user with access to the channel (the Nuxt endpoints only required a
 * session + channel access). Scoped by `channelName = "#<channel.name>"`.
 */
export async function getCommands(channelId: number): Promise<Command[]> {
  const { channel } = await requireChannelAccess(channelId)
  const channelName = commandChannelKey(channel.name)

  const [commands, subCommands] = await Promise.all([
    prisma.commands.findMany({
      where: { channelName },
      select: {
        id: true,
        uniqueName: true,
        name: true,
        enabled: true,
        message: true,
        alias: true,
        isCore: true,
        price: true,
        paid: true,
        timeout: true,
        timeoutEnabled: true,
        timeoutType: true,
        errorMessage: true,
      },
      orderBy: { id: "asc" },
    }),
    prisma.subCommands.findMany({
      where: { channelName },
      select: {
        id: true,
        name: true,
        alias: true,
        message: true,
        parentCommand: true,
      },
      orderBy: { id: "asc" },
    }),
  ])

  return commands.map(({ uniqueName, message, timeoutType, ...command }) => ({
    ...command,
    message: parseCommandMessage(message),
    timeoutType: parseTimeoutType(timeoutType),
    subCommands: subCommands
      .filter((sub) => sub.parentCommand === uniqueName)
      .map((sub) => ({
        id: sub.id,
        name: sub.name,
        alias: sub.alias,
        message: parseCommandMessage(sub.message),
      })),
  }))
}
