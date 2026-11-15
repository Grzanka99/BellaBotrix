"use client"

import { MessageSquareQuoteIcon, PlusIcon } from "lucide-react"

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

import { triggerWordsStore, type TriggerWordsProps } from "../store"
import { TriggerWordFormDialog } from "./trigger-word-form-dialog"
import { TriggerWordsTable } from "./trigger-words-table"

/** Port of `pages/panel/trigger-words.vue`. Receives server data from the route file. */
export function TriggerWordsView(props: TriggerWordsProps) {
  // Same cadence as the Nuxt store: refresh every 10 s while the page is open.
  useAutoRefresh(10_000)

  return (
    <triggerWordsStore.Provider props={props}>
      <PageHeader
        title="Trigger Words"
        description="Words or phrases in chat the bot answers automatically."
      >
        <NewTriggerWordButton />
      </PageHeader>
      <TriggerWordsContent />
    </triggerWordsStore.Provider>
  )
}

function NewTriggerWordButton() {
  return (
    <TriggerWordFormDialog
      trigger={<Button />}
      triggerLabel={
        <>
          <PlusIcon data-icon="inline-start" />
          Add new trigger
        </>
      }
    />
  )
}

function TriggerWordsContent() {
  const hasTriggerWords = triggerWordsStore.useStore(
    (state) => state.triggerWords.length > 0
  )
  const query = triggerWordsStore.useStore((state) => state.query)
  const setQuery = triggerWordsStore.useStore((state) => state.setQuery)

  if (!hasTriggerWords) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareQuoteIcon />
          </EmptyMedia>
          <EmptyTitle>No trigger words yet</EmptyTitle>
          <EmptyDescription>
            Add a trigger to answer a word or phrase in chat automatically.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <NewTriggerWordButton />
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search by trigger..."
      />
      <TriggerWordsTable />
    </div>
  )
}
