import { NextResponse, type NextRequest } from "next/server"

// Keep in sync with SESSION_COOKIE_NAME in lib/server/session.ts (that module
// is server-only and pulls in iron-session, so it is not imported here).
const SESSION_COOKIE_NAME = "bellabotrix-session"

/**
 * Optimistic check only: requests under /panel without a session cookie go
 * straight to /login. The authoritative check is `requireSession()` in the
 * panel layout and in every query / action.
 */
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE_NAME)) {
    return NextResponse.next()
  }

  const loginUrl = new URL("/login", request.url)
  const { pathname, search } = request.nextUrl
  if (pathname !== "/panel") {
    loginUrl.searchParams.set("next", `${pathname}${search}`)
  }

  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/panel", "/panel/:path*"],
}
