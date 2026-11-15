"use client"

import { DatabaseZapIcon, UserIcon } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, type ReactNode, type Ref } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { formatDayTime, formatYearMonth } from "@/lib/prettytime"
import { cn } from "@/lib/utils"

import { formatAvg, type StreamsOverview } from "../schema"

const BASE = "/panel/stream-stats"

/**
 * Port of the two `ScrollableList`s of `pages/panel/stream-stats.vue`,
 * built from shadcn Sidebar primitives as two nested sidebars (months, then
 * the streams of the selected month) next to the main one. Each item shows
 * its average viewers (`avgViewers.vue`). Items are links to `?stream=<id>`;
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

  const selectedMonthRef = useScrollIntoView(selectedMonth)
  const selectedStreamRef = useScrollIntoView(selectedId)

  return (
    <nav
      aria-label="Stream picker"
      className="flex h-64 shrink-0 border-b lg:h-full lg:border-b-0"
    >
      <PickerSidebar label="Months">
        {overview.months.map((month) => {
          const first = overview.streams.find(
            (stream) => stream.month === month.month
          )
          const active = month.month === selectedMonth
          return (
            <SidebarMenuItem key={month.month}>
              <PickerLink
                ref={active ? selectedMonthRef : undefined}
                href={first ? `${BASE}?stream=${first.id}` : BASE}
                active={active}
                label={formatYearMonth(month.month)}
                avg={month.avgViewers}
              />
            </SidebarMenuItem>
          )
        })}
      </PickerSidebar>
      <PickerSidebar label="Streams">
        {monthStreams.map((stream) => {
          const active = stream.id === selectedId
          return (
            <SidebarMenuItem key={stream.id}>
              <PickerLink
                ref={active ? selectedStreamRef : undefined}
                href={`${BASE}?stream=${stream.id}`}
                active={active}
                label={formatDayTime(stream.startedAt)}
                avg={stream.avgViewers}
                mono
              />
            </SidebarMenuItem>
          )
        })}
      </PickerSidebar>
    </nav>
  )
}

/**
 * Keeps the selected item visible when the selection changes (e.g. a month
 * far down the list on first load). Keyed on the selection so the periodic
 * refresh doesn't pull the list back while the user is scrolling it.
 */
function useScrollIntoView(selection: string | number | undefined) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    ref.current?.scrollIntoView({ block: "nearest" })
  }, [selection])

  return ref
}

function PickerSidebar({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <Sidebar
      collapsible="none"
      className="w-auto min-w-0 flex-1 border-r last:border-r-0 lg:w-60 lg:flex-none lg:last:border-r"
    >
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{children}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

function PickerLink({
  ref,
  href,
  active,
  label,
  avg,
  mono,
}: {
  ref?: Ref<HTMLAnchorElement>
  href: string
  active: boolean
  label: string
  avg: number | null
  mono?: boolean
}) {
  const formatted = formatAvg(avg)
  return (
    <>
      <SidebarMenuButton
        isActive={active}
        className="pr-16"
        render={
          <Link
            ref={ref}
            href={href}
            scroll={false}
            aria-current={active ? "true" : undefined}
          />
        }
      >
        {/* Locale / time zone dependent: the server rendering may differ. */}
        <span className={cn(mono && "font-mono")} suppressHydrationWarning>
          {label}
        </span>
      </SidebarMenuButton>
      <SidebarMenuBadge className="gap-1 font-mono">
        {formatted ? (
          <>
            <span className="sr-only">average viewers</span>
            {formatted}
            <UserIcon className="size-3" aria-hidden />
          </>
        ) : (
          <DatabaseZapIcon className="size-3" aria-label="no data" />
        )}
      </SidebarMenuBadge>
    </>
  )
}
