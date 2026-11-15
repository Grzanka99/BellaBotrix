"use server"

import { revalidatePath } from "next/cache"

import {
  authorizeChannelAction,
  fail,
  ok,
  parseInput,
  tryDb,
  type ActionResult,
} from "@/lib/server/action"
import { prisma } from "@/lib/server/db"

import { commandChannelKey, getUniqueName } from "./key"
import {
  SCommandName,
  SCreateCommand,
  SDeleteCommand,
  SUpdateCommand,
  SUpdateSubCommand,
} from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/[channelId]/commands`,
 * `PUT .../commands/subcommands` and `GET .../commands?name=`. Any user with
 * access to the channel (no perms, like Nuxt). Every write is scoped to the
 * authorized channel's `channelName` ("#<Channel.name>"), never by bare id.
 * The Nuxt endpoints made no sync-service calls, so neither do these.
 */

const COMMANDS_PATH = "/panel/commands"

/** Port of `GET /api/[channelId]/commands?name=` (`checkIfTaken`). */
export async function isCommandNameTaken(
  channelId: number,
  input: unknown
): Promise<ActionResult<boolean>> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SCommandName, input)
  if (!parsed.ok) return parsed

  const found = await tryDb(
    () =>
      prisma.commands.findUnique({
        where: {
          uniqueName: getUniqueName(parsed.data.name, auth.channel.name),
        },
        select: { id: true },
      }),
    "Error occurred while checking command name"
  )
  if (!found.ok) return found

  return ok(!!found.data)
}

export async function createCommand(
  channelId: number,
  input: unknown
): Promise<ActionResult<{ id: number }>> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SCreateCommand, input)
  if (!parsed.ok) return parsed

  const { name, message, ...rest } = parsed.data
  const uniqueName = getUniqueName(name, auth.channel.name)

  const existing = await tryDb(
    () =>
      prisma.commands.findUnique({
        where: { uniqueName },
        select: { id: true },
      }),
    "Error occurred while creating command"
  )
  if (!existing.ok) return existing
  if (existing.data) {
    return fail(
      `Command: '${name}' already exists for channel: ${auth.channel.name}`,
      403
    )
  }

  const created = await tryDb(
    () =>
      prisma.commands.create({
        data: {
          uniqueName,
          channelName: commandChannelKey(auth.channel.name),
          name,
          message: { base: message },
          enabled: true,
          alias: "",
          ...rest,
        },
        select: { id: true },
      }),
    "Error occurred while creating command"
  )
  if (!created.ok) return created

  revalidatePath(COMMANDS_PATH)
  return ok(created.data)
}

export async function updateCommand(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateCommand, input)
  if (!parsed.ok) return parsed

  const { id, ...data } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.commands.updateMany({
        where: { id, channelName: commandChannelKey(auth.channel.name) },
        data,
      }),
    "Error occurred while updating command"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Command not found", 404)

  revalidatePath(COMMANDS_PATH)
  return ok()
}

export async function deleteCommand(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteCommand, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () =>
      prisma.commands.deleteMany({
        where: {
          id: parsed.data.id,
          channelName: commandChannelKey(auth.channel.name),
        },
      }),
    "Error occurred while deleting command"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Command not found", 404)

  revalidatePath(COMMANDS_PATH)
  return ok()
}

export async function updateSubCommand(
  channelId: number,
  input: unknown
): Promise<ActionResult> {
  const auth = await authorizeChannelAction(channelId)
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateSubCommand, input)
  if (!parsed.ok) return parsed

  const { id, ...data } = parsed.data
  const updated = await tryDb(
    () =>
      prisma.subCommands.updateMany({
        where: { id, channelName: commandChannelKey(auth.channel.name) },
        data,
      }),
    "Error occurred while updating subcommand"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Subcommand not found", 404)

  revalidatePath(COMMANDS_PATH)
  return ok()
}
