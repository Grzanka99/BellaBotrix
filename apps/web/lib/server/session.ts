import "server-only"

import { getIronSession, type SessionOptions } from "iron-session"
import { cookies } from "next/headers"

import type { TPerms } from "@/lib/perms"

/** Same shape as `TAuthSession` in `types/auth.type.ts`. */
export type TAuthSession = {
  id: number
  username: string
  channelId: number
  perms: TPerms[]
}

export const SESSION_COOKIE_NAME = "bellabotrix-session"

const DEV_SESSION_PASSWORD = "bellabotrix-dev-only-session-password-not-secret"

function getSessionPassword(): string {
  const password = process.env.SESSION_PASSWORD

  if (password && password.length >= 32) {
    return password
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "SESSION_PASSWORD must be set to a random string of at least 32 characters."
    )
  }

  return DEV_SESSION_PASSWORD
}

function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: SESSION_COOKIE_NAME,
    cookieOptions: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
  }
}

/**
 * Raw iron-session handle bound to the request cookies. Reading works
 * everywhere; `save()` / `destroy()` only work in Server Actions and Route
 * Handlers. Prefer the helpers in `lib/server/auth.ts` for reads.
 */
export async function getSessionStore() {
  return getIronSession<Partial<TAuthSession>>(
    await cookies(),
    getSessionOptions()
  )
}

/** Writes the logged-in user into the session cookie (actions / route handlers only). */
export async function startSession(data: TAuthSession): Promise<void> {
  const session = await getSessionStore()
  session.id = data.id
  session.username = data.username
  session.channelId = data.channelId
  session.perms = data.perms
  await session.save()
}

/** Clears the session cookie (actions / route handlers only). */
export async function destroySession(): Promise<void> {
  const session = await getSessionStore()
  session.destroy()
}
