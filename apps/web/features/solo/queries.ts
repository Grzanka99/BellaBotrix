import "server-only"

import type { Prisma } from "@prisma/client"

import {
  clampPage,
  PAGE_SIZE,
  type ListParams,
  type Paginated,
} from "@/lib/list-params"
import { requireChannelAccess } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"

import type { Solo, SoloTotals } from "./schema"

const soloSelect = {
  id: true,
  user1: true,
  user2: true,
  inProgress: true,
  points: true,
  winner: true,
} as const

export type SolosPage = Paginated<Solo> & { totals: SoloTotals }

/**
 * Port of `GET /api/[channelId]/solo` (channel key `#<name>`, same as Nuxt).
 * Nuxt returned every solo and filtered in the browser (user1 or user2
 * contains the query, case-insensitive), showing them newest first
 * (`toReversed()`); this returns one page of the same result, newest first,
 * plus the channel-wide totals.
 */
export async function getSolosPage(
  channelId: number,
  params: ListParams
): Promise<SolosPage> {
  const { channel } = await requireChannelAccess(channelId)
  const channelKey = `#${channel.name}`

  const where: Prisma.SoloWhereInput = {
    channel: channelKey,
    ...(params.q
      ? {
          OR: [
            { user1: { contains: params.q, mode: "insensitive" } },
            { user2: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  }

  const [total, all, finished] = await Promise.all([
    prisma.solo.count({ where }),
    prisma.solo.count({ where: { channel: channelKey } }),
    prisma.solo.count({
      where: {
        channel: channelKey,
        AND: [{ winner: { not: null } }, { winner: { not: "" } }],
      },
    }),
  ])

  const page = clampPage(params.page, total, PAGE_SIZE)
  const rows = await prisma.solo.findMany({
    where,
    select: soloSelect,
    orderBy: { id: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return {
    rows,
    total,
    page,
    pageSize: PAGE_SIZE,
    totals: { total: all, finished },
  }
}
