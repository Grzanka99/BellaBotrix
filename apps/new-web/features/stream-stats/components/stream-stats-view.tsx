"use client"

import { ChartColumnIcon, SearchXIcon } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { formatYearMonth } from "@/lib/prettytime"

import type {
  LiveStatus,
  SelectedStreamStats,
  StreamsOverview,
} from "../schema"
import { LiveIndicator } from "./live-indicator"
import { StreamCharts } from "./stream-charts"
import { StreamPicker } from "./stream-picker"

/**
 * Port of `pages/panel/stream-stats.vue` + `composables/stream-stats.ts`.
 * Kept inside the panel shell (Nuxt disabled its layout to put the pickers
 * in the navigation slot); the selected stream is `?stream=<id>` instead of
 * localStorage, so the server loads only that stream's stats.
 */
export function StreamStatsView({
  overview,
  liveStatus,
  selected,
  requestedMissing,
}: {
  overview: StreamsOverview
  liveStatus: LiveStatus
  selected: SelectedStreamStats | null
  requestedMissing: boolean
}) {
  // Nuxt polled islive / streams every 10 s and the selected stats every 30 s;
  // one 10 s refresh reloads all of them.
  useAutoRefresh(10_000)

  const hasStreams = overview.streams.length > 0

  // `data-page-bleed` drops the panel layout's padding, so the two picker
  // drawers sit flush against the sidebar and run the full height (below the
  // 3.5rem header) with their own scrolling, like the Nuxt page.
  return (
    <div
      data-page-bleed
      className="flex flex-1 flex-col lg:h-[calc(100svh-3.5rem)] lg:flex-none lg:flex-row"
    >
      {hasStreams && (
        <StreamPicker overview={overview} selectedId={selected?.stream.id} />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-6 p-4 md:p-6 lg:overflow-y-auto">
        <PageHeader
          title="Stream Stats"
          description="Viewers and chat activity of the channel's streams."
        >
          <LiveIndicator status={liveStatus} />
        </PageHeader>
        {!hasStreams ? (
          <Empty className="border">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <ChartColumnIcon />
              </EmptyMedia>
              <EmptyTitle>No streams yet</EmptyTitle>
              <EmptyDescription>
                Stats appear here once the bot has recorded a stream.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : selected ? (
          <SelectedStream selected={selected} />
        ) : (
          <StreamNotFound missing={requestedMissing} />
        )}
      </div>
    </div>
  )
}

function StreamNotFound({ missing }: { missing: boolean }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchXIcon />
        </EmptyMedia>
        <EmptyTitle>Stream not found</EmptyTitle>
        <EmptyDescription>
          {missing
            ? "This stream doesn't exist or doesn't belong to the selected channel."
            : "Pick a stream on the left."}
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/panel/stream-stats" className={buttonVariants()}>
          Show the latest stream
        </Link>
      </EmptyContent>
    </Empty>
  )
}

function fmt(value: number) {
  return Number.isFinite(value) ? value.toLocaleString("en-US") : "—"
}

function SelectedStream({ selected }: { selected: SelectedStreamStats }) {
  const { stream, data, samples, points } = selected
  const stats = [
    { label: "avg. viewers", value: fmt(data.avgViewers) },
    { label: "max viewers", value: fmt(data.maxViewers) },
    { label: "avg. messages (per 30s)", value: fmt(data.avgMsg) },
    { label: "total messages", value: fmt(data.totalMsg) },
  ]

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <span suppressHydrationWarning>
          {formatYearMonth(stream.month)} ·{" "}
          {new Date(stream.startedAt).toLocaleString("en-US")}
        </span>
        {stream.live && <Badge variant="destructive">in progress</Badge>}
        <span className="tabular-nums">
          {samples.toLocaleString("en-US")} samples ·{" "}
          {points.length.toLocaleString("en-US")} chart points
        </span>
      </div>
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">
                {stat.value}
              </CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      {samples === 0 ? (
        <Empty className="border">
          <EmptyHeader>
            <EmptyTitle>No data for this stream</EmptyTitle>
            <EmptyDescription>
              The bot hasn&apos;t recorded any samples for it.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <StreamCharts points={points} />
      )}
    </div>
  )
}
