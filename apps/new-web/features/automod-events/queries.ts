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

import type { AutomodEvent } from "./schema"

const automodEventSelect = {
  id: true,
  message: true,
  target: true,
  action: true,
  handler: true,
  duration: true,
} as const

/**
 * Port of `GET /api/[channelId]/automod-events` (channel key `#<name>`, same
 * as Nuxt). Nuxt returned every event unordered and had no search; this
 * returns one page, newest first, optionally filtered by message / target /
 * action / handler (case-insensitive contains).
 */
export async function getAutomodEventsPage(
  channelId: number,
  params: ListParams
): Promise<Paginated<AutomodEvent>> {
  const { channel } = await requireChannelAccess(channelId)

  const where: Prisma.AutomodEventsWhereInput = {
    channel: `#${channel.name}`,
    ...(params.q
      ? {
          OR: (["message", "target", "action", "handler"] as const).map(
            (field) => ({
              [field]: { contains: params.q, mode: "insensitive" },
            })
          ),
        }
      : {}),
  }

  const total = await prisma.automodEvents.count({ where })
  const page = clampPage(params.page, total, PAGE_SIZE)
  const rows = await prisma.automodEvents.findMany({
    where,
    select: automodEventSelect,
    orderBy: { id: "desc" },
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  })

  return { rows, total, page, pageSize: PAGE_SIZE }
}
