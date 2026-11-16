"use client"

import { createStoreContext } from "@/lib/create-store-context"

import type { Command } from "./schema"

/** Port of `store/commands.store.ts` (the client half: list + search filter). */

export type CommandsProps = {
  channelId: number
  /** Twitch user id of the channel, for the 7TV emotes. */
  twitchChannelId: string
  /** Twitch login, shown in the "new command" dialog. */
  channelName: string
  commands: Command[]
}

type CommandsState = {
  channelId: number
  channelName: string
  /** Server data; replaced whenever fresh props arrive. */
  commands: Command[]
  query: string
  setQuery: (query: string) => void
  /** Optimistic local patch, e.g. the enabled switch before the action returns. */
  patchCommand: (id: number, patch: Partial<Command>) => void
}

export const commandsStore = createStoreContext<CommandsState, CommandsProps>({
  name: "CommandsStore",
  create: (props) => (set) => ({
    channelId: props.channelId,
    channelName: props.channelName,
    commands: props.commands,
    query: "",
    setQuery: (query) => set({ query }),
    patchCommand: (id, patch) =>
      set((state) => ({
        commands: state.commands.map((command) =>
          command.id === id ? { ...command, ...patch } : command
        ),
      })),
  }),
  sync: (props) => ({
    channelId: props.channelId,
    channelName: props.channelName,
    commands: props.commands,
  }),
})

/** Same filter as the Nuxt store: name or alias contains the query. */
export function filterCommands(commands: Command[], query: string): Command[] {
  const needle = query.toLowerCase()
  if (!needle) return commands
  return commands.filter(
    (command) =>
      command.name.toLowerCase().includes(needle) ||
      command.alias.toLowerCase().includes(needle)
  )
}
