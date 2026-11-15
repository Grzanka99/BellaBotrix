import { randomBytes } from "node:crypto"

import { NextResponse } from "next/server"

import {
  buildTwitchAuthorizeUrl,
  OAUTH_STATE_COOKIE,
} from "@/lib/server/twitch"

/** Port of `apps/web/server/api/auth-redirect.ts`: sends the browser to Twitch OAuth. */
export async function GET() {
  const state = randomBytes(16).toString("hex")
  const response = NextResponse.redirect(buildTwitchAuthorizeUrl(state))

  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/api/auth",
    maxAge: 60 * 10,
  })

  return response
}
