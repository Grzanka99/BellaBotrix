import { NextResponse, type NextRequest } from "next/server"

import { getCurrentUser } from "@/lib/server/auth"
import { prisma } from "@/lib/server/db"
import { indicateChannelsListUpdate, syncInBackground } from "@/lib/server/sync"
import {
  getChannelRefreshKey,
  OAUTH_STATE_COOKIE,
  validateToken,
} from "@/lib/server/twitch"

/**
 * Port of `server/api/auth.ts`: the Twitch OAuth callback.
 * The path `/api/auth` is the redirect URI registered with Twitch, do not move it.
 */
export async function GET(request: NextRequest) {
  const redirectTo = (path: string) => {
    const response = NextResponse.redirect(new URL(path, request.url))
    response.cookies.delete({ name: OAUTH_STATE_COOKIE, path: "/api/auth" })
    return response
  }
  const failed = () => redirectTo("/panel?authfailed=true")

  const user = await getCurrentUser()
  if (!user) {
    return redirectTo("/login")
  }

  const { searchParams } = request.nextUrl
  const code = searchParams.get("code")
  const error = searchParams.get("error")
  const state = searchParams.get("state")
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value

  if (!code || error || !state || state !== expectedState) {
    return failed()
  }

  const tokens = await getChannelRefreshKey(code)
  if (!tokens?.refresh_token) {
    return failed()
  }

  const validated = await validateToken(tokens.access_token)
  if (!validated || !validated.user_id) {
    return failed()
  }

  try {
    const channel = await prisma.channel.upsert({
      where: { channel_id: validated.user_id },
      update: { token: tokens.refresh_token },
      create: {
        name: validated.login,
        channel_id: validated.user_id,
        token: tokens.refresh_token,
        enabled: true,
      },
      select: { id: true },
    })

    await prisma.webuiUser.update({
      where: { id: user.id },
      data: { channelId: channel.id },
    })

    const existingAccess = await prisma.channelAccess.findFirst({
      where: { userid: user.id, channelId: channel.id },
      select: { id: true },
    })

    if (!existingAccess) {
      await prisma.channelAccess.create({
        data: { userid: user.id, channelId: channel.id },
      })
    }
  } catch (dbError) {
    console.error("[auth] storing Twitch channel failed", dbError)
    return failed()
  }

  syncInBackground("channels list update", indicateChannelsListUpdate)

  return redirectTo("/panel")
}
