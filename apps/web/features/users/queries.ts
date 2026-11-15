import "server-only"

import type { Prisma } from "@prisma/client"

import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import {
  clampPage,
  PAGE_SIZE,
  type ListParams,
  type Paginated,
} from "@/lib/list-params"
import type { Chatter, ChatterSort, ChatterTotals } from "./schema"

/** Columns sent to the client (never select more than the UI needs). */
export const chatterSelect = {
  id: true,
  userid: true,
  username: true,
  sentMessages: true,
  points: true,
  isBot: true,
} as const

/** `User.channel` key, exactly as `GET /api/[channelId]/users` builds it. */
export function chattersChannelKey(channelName: string) {
  return `#${channelName}`
}

const ORDER_BY: Record<ChatterSort, Prisma.UserOrderByWithRelationInput[]> = {
  none: [{ id: "desc" }],
  "points-desc": [{ points: "desc" }, { id: "desc" }],
  "points-asc": [{ points: "asc" }, { id: "desc" }],
  "sent-desc": [{ sentMessages: "desc" }, { id: "desc" }],
  "sent-asc": [{ sentMessages: "asc" }, { id: "desc" }],
}

export type ChattersPage = Paginated<Chatter> & { totals: ChatterTotals }

/**
 * Port of `GET /api/[channelId]/users`. Nuxt returned every chatter of the
 * channel and filtered / sorted in the browser; this returns one page of the
 * search result (same filter: username contains, case-insensitive; same
 * sort options) plus the channel-wide totals the page header shows.
 */
export async function getChattersPage(
  channelId: number,
  params: ListParams & { sort: ChatterSort }
): Promise<ChattersPage> {
  const { channel } = await requireChannelAccess(channelId)
  const channelKey = chattersChannelKey(channel.name)

  const where: Prisma.UserWhereInput = {
    channel: channelKey,
    ...(params.q
      ? { username: { contains: params.q, mode: "insensitive" } }
      : {}),
  }

  const [total, nonBot] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.aggregate({
      where: { channel: channelKey, isBot: false },
      _count: { _all: true },
      _sum: { points: true },
    }),
  ])

  const page = clampPage(params.page, total, PAGE_SIZE)
  const rows = await prisma.user.findMany({
    where,
    select: chatterSelect,
    orderBy: ORDER_BY[params.sort],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  const users = nonBot._count._all
  const points = nonBot._sum.points ?? 0

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totals: { users, points, meanPoints: users ? points / users : Number.NaN },
  }
}
