"use client"

import { DatabaseZapIcon, UserIcon } from "lucide-react"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDayTime, formatYearMonth } from "@/lib/prettytime"
import { cn } from "@/lib/utils"

import { formatAvg, type StreamsOverview } from "../schema"

const BASE = "/panel/stream-stats"

/**
 * Port of the two `ScrollableList`s of `pages/panel/stream-stats.vue`
 * (months, then the streams of the selected month), each item with its
 * average viewers (`avgViewers.vue`). Items are links to `?stream=<id>`;
 * picking a month opens its latest stream, like the Nuxt watcher did.
 */
export function StreamPicker({
  overview,
  selectedId,
}: {
  overview: StreamsOverview
  selectedId: number | undefined
}) {
  const selectedMonth =
    overview.streams.find((stream) => stream.id === selectedId)?.month ??
    overview.months[0]?.month
  const monthStreams = overview.streams.filter(
    (stream) => stream.month === selectedMonth
  )

  return (
    <div className="flex flex-col gap-4">
      <Card size="sm">
        <CardHeader>
          <CardTitle>Months</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-48">
            <ul className="flex flex-col gap-1 pr-3">
              {overview.months.map((month) => {
                const first = overview.streams.find(
                  (stream) => stream.month === month.month
                )
                return (
                  <li key={month.month}>
                    <PickerLink
                      href={first ? `${BASE}?stream=${first.id}` : BASE}
                      active={month.month === selectedMonth}
                      label={formatYearMonth(month.month)}
                      avg={month.avgViewers}
                    />
                  </li>
                )
              })}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
      <Card size="sm">
        <CardHeader>
          <CardTitle>Streams</CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-72">
            <ul className="flex flex-col gap-1 pr-3">
              {monthStreams.map((stream) => (
                <li key={stream.id}>
                  <PickerLink
                    href={`${BASE}?stream=${stream.id}`}
                    active={stream.id === selectedId}
                    label={formatDayTime(stream.startedAt)}
                    avg={stream.avgViewers}
                    mono
                  />
                </li>
              ))}
            </ul>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function PickerLink({
  href,
  active,
  label,
  avg,
  mono,
}: {
  href: string
  active: boolean
  label: string
  avg: number | null
  mono?: boolean
}) {
  const formatted = formatAvg(avg)
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "true" : undefined}
      className={cn(
        buttonVariants({ variant: active ? "secondary" : "ghost", size: "sm" }),
        "w-full justify-between gap-3"
      )}
    >
      {/* Locale / time zone dependent: the server's rendering may differ. */}
      <span className={cn(mono && "font-mono")} suppressHydrationWarning>
        {label}
      </span>
      <span
        className="flex items-center gap-1 font-mono text-xs text-muted-foreground"
        title="average viewers"
      >
        {formatted ? (
          <>
            {formatted}
            <UserIcon className="size-3" />
          </>
        ) : (
          <DatabaseZapIcon className="size-3" aria-label="no data" />
        )}
      </span>
    </Link>
  )
}
