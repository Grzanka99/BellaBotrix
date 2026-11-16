"use client"

import { ShieldAlertIcon } from "lucide-react"
import { useSearchParams } from "next/navigation"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  RangeSummary,
  UrlPagination,
  UrlSearchInput,
} from "@/components/list-controls"
import type { Paginated } from "@/lib/list-params"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"

import { formatDuration, type AutomodEvent } from "../schema"

/** Port of `pages/panel/automod-events.vue` (read-only). */
export function AutomodEventsView({ data }: { data: Paginated<AutomodEvent> }) {
  // Same cadence as the Nuxt store: refresh every 10 s while the page is open.
  useAutoRefresh(10_000)
  const searching = !!useSearchParams().get("q")
  const { rows, page, pageSize, total } = data

  return (
    <>
      <PageHeader
        title="Automod Events"
        description="Actions the bot's automod took in chat."
        toolbar={
          total === 0 && !searching ? undefined : (
            <UrlSearchInput placeholder="Search by message, target, action..." />
          )
        }
      >
        <Badge variant="secondary" className="tabular-nums">
          Total events: {total.toLocaleString("en-US")}
        </Badge>
      </PageHeader>
      {total === 0 && !searching ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <ShieldAlertIcon />
            </EmptyMedia>
            <EmptyTitle>No automod events yet</EmptyTitle>
            <EmptyDescription>
              Bans and timeouts issued by automod modules show up here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Message</TableHead>
                <TableHead>Target (user id)</TableHead>
                <TableHead>Action taken</TableHead>
                <TableHead className="text-right">Duration (s)</TableHead>
                <TableHead>Automod module</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((event) => (
                <TableRow key={event.id}>
                  <TableCell className="max-w-0 min-w-64 whitespace-normal">
                    <span className="line-clamp-3 break-words">
                      {event.message}
                    </span>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {event.target}
                  </TableCell>
                  <TableCell>
                    <Badge variant="destructive">{event.action}</Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatDuration(event.duration)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{event.handler}</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Found 0 events
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <div className="flex flex-col items-center gap-2">
            <RangeSummary
              page={page}
              pageSize={pageSize}
              total={total}
              noun="events"
            />
            <UrlPagination page={page} pageSize={pageSize} total={total} />
          </div>
        </div>
      )}
    </>
  )
}
