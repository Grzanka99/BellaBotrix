"use client"

import { ArrowDownUpIcon } from "lucide-react"
import { useTransition } from "react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAutoRefresh } from "@/hooks/use-auto-refresh"
import { notifyActionError } from "@/lib/notify"
import { cn } from "@/lib/utils"

import { updateChatter } from "../actions"
import {
  canItBeBot,
  CHATTER_SORT_LABELS,
  CHATTER_SORTS,
  type Chatter,
  type ChatterSort,
} from "../schema"
import { usersStore, type UsersProps } from "../store"
import {
  RangeSummary,
  UrlPagination,
  UrlSearchInput,
  useListNavigation,
} from "@/components/list-controls"

const SORT_ITEMS = CHATTER_SORTS.map((value) => ({
  value,
  label: CHATTER_SORT_LABELS[value],
}))

/** Port of `pages/panel/users.vue`. */
export function UsersView(props: UsersProps) {
  // Same cadence as the Nuxt store: refresh every 10 s while the page is open.
  useAutoRefresh(10_000)

  return (
    <usersStore.Provider props={props}>
      <PageHeader
        title="Users"
        description="Chatters the bot has seen in this channel."
      >
        <UsersTotals />
      </PageHeader>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <UrlSearchInput placeholder="Search by username..." />
          <SortSelect sort={props.sort} />
        </div>
        <UsersTable />
        <UsersFooter />
      </div>
    </usersStore.Provider>
  )
}

function UsersTotals() {
  const totals = usersStore.useStore((state) => state.data.totals)
  return (
    <div className="flex flex-wrap gap-2">
      <Badge variant="secondary" className="tabular-nums">
        Total users: {totals.users.toLocaleString("en-US")}
      </Badge>
      <Badge variant="secondary" className="tabular-nums">
        Total points: {totals.points.toLocaleString("en-US")}
      </Badge>
    </div>
  )
}

function SortSelect({ sort }: { sort: ChatterSort }) {
  const { navigate } = useListNavigation()
  return (
    <Select
      items={SORT_ITEMS}
      value={sort}
      onValueChange={(value) =>
        navigate({ sort: value === "none" || !value ? null : value })
      }
    >
      <SelectTrigger aria-label="Sort users" className="min-w-52">
        <ArrowDownUpIcon />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {SORT_ITEMS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}

function UsersTable() {
  const rows = usersStore.useStore((state) => state.data.rows)
  const meanPoints = usersStore.useStore(
    (state) => state.data.totals.meanPoints
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Is bot</TableHead>
          <TableHead>Username</TableHead>
          <TableHead className="w-32 text-right">Sent</TableHead>
          <TableHead className="w-32 text-right">Points</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((chatter) => (
          <ChatterRow
            key={chatter.id}
            chatter={chatter}
            suspicious={!chatter.isBot && canItBeBot(chatter, meanPoints)}
          />
        ))}
        {rows.length === 0 && (
          <TableRow>
            <TableCell
              colSpan={4}
              className="h-24 text-center text-muted-foreground"
            >
              Found 0 users
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}

function ChatterRow({
  chatter,
  suspicious,
}: {
  chatter: Chatter
  suspicious: boolean
}) {
  const channelId = usersStore.useStore((state) => state.channelId)
  const patchChatter = usersStore.useStore((state) => state.patchChatter)
  const [pending, startTransition] = useTransition()

  function onBotChange(isBot: boolean) {
    patchChatter(chatter.id, { isBot })
    startTransition(async () => {
      const result = await updateChatter(channelId, { id: chatter.id, isBot })
      if (!result.ok) {
        patchChatter(chatter.id, { isBot: !isBot })
        notifyActionError("Error occurred while updating user", result)
      }
    })
  }

  return (
    <TableRow
      data-suspicious={suspicious || undefined}
      className={cn(
        chatter.isBot && "text-muted-foreground",
        suspicious && "bg-amber-500/15 hover:bg-amber-500/20"
      )}
    >
      <TableCell>
        <Switch
          checked={chatter.isBot}
          disabled={pending}
          onCheckedChange={onBotChange}
          aria-label={
            chatter.isBot
              ? `Unmark ${chatter.username} as bot`
              : `Mark ${chatter.username} as bot`
          }
        />
      </TableCell>
      <TableCell>
        <Tooltip>
          <TooltipTrigger render={<span />}>{chatter.username}</TooltipTrigger>
          <TooltipContent>User id: {chatter.userid}</TooltipContent>
        </Tooltip>
        {suspicious && (
          <Badge variant="outline" className="ml-2">
            possibly a bot
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {chatter.sentMessages.toLocaleString("en-US")}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {chatter.points.toLocaleString("en-US")}
      </TableCell>
    </TableRow>
  )
}

function UsersFooter() {
  const { page, pageSize, total } = usersStore.useStore((state) => state.data)
  return (
    <div className="flex flex-col items-center gap-2">
      <RangeSummary
        page={page}
        pageSize={pageSize}
        total={total}
        noun="users"
      />
      <UrlPagination page={page} pageSize={pageSize} total={total} />
    </div>
  )
}
