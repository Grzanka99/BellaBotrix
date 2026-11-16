import "server-only"

import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { cache } from "react"

import { parsePerms, type TPerms } from "@/lib/perms"
import { prisma } from "@/lib/server/db"
import { getSessionStore, type TAuthSession } from "@/lib/server/session"

export { canSeeWithPerms, hasPerms } from "@/lib/perms"

/**
 * Data access layer for "who is the caller and what may they touch".
 * Every query (`features/*\/queries.ts`) and every action must go through
 * these helpers; never trust ids or cookies coming from the client.
 */

/** The logged-in user, re-read from the database. Never contains the password hash. */
export type CurrentUser = {
  id: number
  username: string
  channelId: number
  perms: TPerms[]
}

/** A channel the user may manage. Never contains the Twitch token. */
export type ChannelSummary = {
  /** DB id of `Channel` (what every channel-scoped table references). */
  id: number
  /** Twitch login name. */
  name: string
  /** Twitch user id. */
  channel_id: string
}

export const SELECTED_CHANNEL_COOKIE = "selectedChannel"

/** Session data from the cookie only (no DB hit). Use `getCurrentUser()` for decisions. */
export const getSession = cache(async (): Promise<TAuthSession | null> => {
  const session = await getSessionStore()

  if (!session.username || typeof session.id !== "number") {
    return null
  }

  return {
    id: session.id,
    username: session.username,
    channelId: session.channelId ?? -1,
    perms: session.perms ?? [],
  }
})

/**
 * Session user re-read from `WebuiUser` so perms are always fresh.
 * A deleted (or renamed) user counts as logged out.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const session = await getSession()

  if (!session) {
    return null
  }

  const user = await prisma.webuiUser.findUnique({
    where: { id: session.id },
    select: { id: true, username: true, channelId: true, perms: true },
  })

  if (!user || user.username !== session.username) {
    return null
  }

  return {
    id: user.id,
    username: user.username,
    channelId: user.channelId,
    perms: parsePerms(user.perms),
  }
})

/** For pages, layouts and queries: the current user, or a redirect to `/login`. */
export async function requireSession(): Promise<CurrentUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return user
}

/** Port of `/api/chacc`: channels the current user has a `ChannelAccess` row for. */
export const getAccessibleChannels = cache(
  async (): Promise<ChannelSummary[]> => {
    const user = await getCurrentUser()

    if (!user) {
      return []
    }

    const access = await prisma.channelAccess.findMany({
      where: { userid: user.id },
      select: { channelId: true },
    })

    return prisma.channel.findMany({
      where: { id: { in: access.map((row) => row.channelId) } },
      select: { id: true, name: true, channel_id: true },
      orderBy: { id: "asc" },
    })
  }
)

/**
 * Port of `getChannelFromEvent`: the channel if the current user has access
 * to it, otherwise `null`.
 */
export const getChannelForUser = cache(
  async (channelId: number): Promise<ChannelSummary | null> => {
    if (!Number.isInteger(channelId) || channelId <= 0) {
      return null
    }

    const channels = await getAccessibleChannels()
    return channels.find((channel) => channel.id === channelId) ?? null
  }
)

/**
 * The channel the panel is working on: the `selectedChannel` cookie if the
 * user can access it, else the first accessible channel, else `null`.
 */
export const getSelectedChannel = cache(
  async (): Promise<ChannelSummary | null> => {
    const channels = await getAccessibleChannels()
    const cookieValue = (await cookies()).get(SELECTED_CHANNEL_COOKIE)?.value
    const selectedId = Number(cookieValue)

    return (
      channels.find((channel) => channel.id === selectedId) ??
      channels[0] ??
      null
    )
  }
)

/**
 * For pages and queries that receive a channel id: the channel, after
 * checking the current user may access it. Redirects to `/login` without a
 * session and renders the 404 page without access.
 */
export async function requireChannelAccess(
  channelId: number
): Promise<{ user: CurrentUser; channel: ChannelSummary }> {
  const user = await requireSession()
  const channel = await getChannelForUser(channelId)

  if (!channel) {
    notFound()
  }

  return { user, channel }
}

/** Sets the selected channel cookie (Server Actions / Route Handlers only). */
export async function setSelectedChannelCookie(channelId: number) {
  ;(await cookies()).set(SELECTED_CHANNEL_COOKIE, String(channelId), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  })
}
