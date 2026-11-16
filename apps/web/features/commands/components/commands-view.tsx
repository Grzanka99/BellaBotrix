"use client"

import { PlusIcon, TerminalIcon } from "lucide-react"

import { PageHeader } from "@/components/page-header"
import { SearchInput } from "@/components/search-input"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { EmotesProvider } from "@/features/emotes/components/emotes-provider"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import { commandsStore, type CommandsProps } from "../store"
import { CommandsTable } from "./commands-table"
import { NewCommandDialog } from "./new-command-dialog"

/** Port of `pages/panel/commands.vue`. Receives server data from the route file. */
export function CommandsView(props: CommandsProps) {
  // Same cadence as the Nuxt store: refresh commands + subcommands every 10 s.
  useAutoRefresh(10_000)

  return (
    <commandsStore.Provider props={props}>
      <EmotesProvider twitchChannelId={props.twitchChannelId}>
        <PageHeader
          title="Commands"
          description="Chat commands of the channel and what the bot answers."
        >
          <NewCommandButton />
        </PageHeader>
        <CommandsContent />
      </EmotesProvider>
    </commandsStore.Provider>
  )
}

function NewCommandButton() {
  return (
    <NewCommandDialog
      trigger={<Button />}
      triggerLabel={
        <>
          <PlusIcon data-icon="inline-start" />
          Add new command
        </>
      }
    />
  )
}

function CommandsContent() {
  const hasCommands = commandsStore.useStore(
    (state) => state.commands.length > 0
  )
  const query = commandsStore.useStore((state) => state.query)
  const setQuery = commandsStore.useStore((state) => state.setQuery)

  if (!hasCommands) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <TerminalIcon />
          </EmptyMedia>
          <EmptyTitle>Found 0 commands</EmptyTitle>
          <EmptyDescription>
            Add a command the bot answers in chat.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewCommandButton />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by name..."
      />
      <CommandsTable />
    </div>
  )
}
