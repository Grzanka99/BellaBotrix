"use client"

import { AlarmClockIcon, PlusIcon } from "lucide-react"

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
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import { timersStore, type TimersProps } from "../store"
import { TimerFormDialog } from "./timer-form-dialog"
import { TimersTable } from "./timers-table"

/** Port of `pages/panel/timers.vue`. Receives server data from the route file. */
export function TimersView(props: TimersProps) {
  // Same cadence as the Nuxt store: refresh every 10 s while the page is open.
  useAutoRefresh(10_000)

  return (
    <timersStore.Provider props={props}>
      <PageHeader
        title="Timers"
        description="Messages the bot posts in chat on a fixed interval."

        toolbar={<TimersSearch />}
      >
        <NewTimerButton />
      </PageHeader>
      <TimersContent />
    </timersStore.Provider>
  )
}

function NewTimerButton() {
  return (
    <TimerFormDialog
      trigger={<Button />}
      triggerLabel={
        <>
          <PlusIcon data-icon="inline-start" />
          Add new timer
        </>
      }
    />
  )
}

/** Search box for the header toolbar; hidden while there is nothing to search. */
function TimersSearch() {
  const hasItems = timersStore.useStore((state) => state.timers.length > 0)
  const query = timersStore.useStore((state) => state.query)
  const setQuery = timersStore.useStore((state) => state.setQuery)

  if (!hasItems) {
    return null
  }

  return (
    <SearchInput
      value={query}
      onChange={setQuery}
      placeholder="Search by message..."
    />
  )
}

function TimersContent() {
  const hasTimers = timersStore.useStore((state) => state.timers.length > 0)

  if (!hasTimers) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <AlarmClockIcon />
          </EmptyMedia>
          <EmptyTitle>No timers yet</EmptyTitle>
          <EmptyDescription>
            Add a timer to post a message in chat every few minutes.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewTimerButton />
        </EmptyContent>
      </Empty>
    )
  }

  return <TimersTable />
}
