"use client"

import { useSyncExternalStore } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { fromNS } from "@/lib/prettytime"

import type { StatSample } from "../schema"

/**
 * Port of `components/stream-stats/chart.vue` (apexcharts → shadcn Chart).
 * Same series as Nuxt (viewers, messages) plus follows / subscribers / new
 * chatters, which `StreamStats` records but the Nuxt page never plotted.
 */

const viewersConfig = {
  viewers: { label: "Viewers", color: "var(--chart-1)" },
} satisfies ChartConfig

const messagesConfig = {
  messages: { label: "Messages", color: "var(--chart-2)" },
} satisfies ChartConfig

const engagementConfig = {
  follows: { label: "Follows", color: "var(--chart-1)" },
  subscribers: { label: "Subscribers", color: "var(--chart-3)" },
  newChatters: { label: "New chatters", color: "var(--chart-5)" },
} satisfies ChartConfig

const noop = () => () => {}

/** Charts format times in the viewer's time zone, so render them client-side only (Nuxt `<ClientOnly>`). */
function useIsClient() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
}

function timeLabel(_: unknown, payload: readonly { payload?: StatSample }[]) {
  const sample = payload[0]?.payload
  return sample ? fromNS(sample.timestamp) : ""
}

function ChartCard({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  const isClient = useIsClient()
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isClient ? children : <Skeleton className="h-64 w-full" />}
      </CardContent>
    </Card>
  )
}

function SingleAreaChart({
  points,
  config,
  dataKey,
}: {
  points: StatSample[]
  config: ChartConfig
  dataKey: "viewers" | "messages"
}) {
  const fillId = `fill-${dataKey}`
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <AreaChart data={points} margin={{ left: 0, right: 12 }}>
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor={`var(--color-${dataKey})`}
              stopOpacity={0.8}
            />
            <stop
              offset="95%"
              stopColor={`var(--color-${dataKey})`}
              stopOpacity={0.1}
            />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="timestamp"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={48}
          tickFormatter={fromNS}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={40}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent indicator="line" labelFormatter={timeLabel} />
          }
        />
        <Area
          dataKey={dataKey}
          type="monotone"
          fill={`url(#${fillId})`}
          stroke={`var(--color-${dataKey})`}
          strokeWidth={2}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}

export function StreamCharts({ points }: { points: StatSample[] }) {
  return (
    <div className="flex flex-col gap-4">
      <ChartCard title="Viewers" description="Viewer count over the stream.">
        <SingleAreaChart
          points={points}
          config={viewersConfig}
          dataKey="viewers"
        />
      </ChartCard>
      <ChartCard
        title="Messages"
        description="Chat messages over the stream (summed per chart point)."
      >
        <SingleAreaChart
          points={points}
          config={messagesConfig}
          dataKey="messages"
        />
      </ChartCard>
      <ChartCard
        title="Follows, subscribers and new chatters"
        description="Summed per chart point."
      >
        <ChartContainer
          config={engagementConfig}
          className="aspect-auto h-64 w-full"
        >
          <LineChart data={points} margin={{ left: 0, right: 12 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={48}
              tickFormatter={fromNS}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent labelFormatter={timeLabel} />}
            />
            <ChartLegend content={<ChartLegendContent />} />
            {(["follows", "subscribers", "newChatters"] as const).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </ChartCard>
    </div>
  )
}
