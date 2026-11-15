import "server-only"

import type { TOption } from "bellatrix"

/** Port of `apps/web/server/utils/api-connector.ts` (Twitch OAuth helpers). */

/** Short-lived cookie carrying the OAuth `state` between auth-redirect and the callback. */
export const OAUTH_STATE_COOKIE = "twitch-oauth-state"

const OAUTH_URL = "https://id.twitch.tv/oauth2/token"
const VALIDATE_URL = "https://id.twitch.tv/oauth2/validate"
const AUTHORIZE_URL = "https://id.twitch.tv/oauth2/authorize"

const TWITCH_SCOPES = [
  "moderator:read:chatters",
  "moderation:read",
  "channel:moderate",
  "moderator:read:followers",
  "moderator:manage:banned_users",
  "moderator:manage:blocked_terms",
]

type TTwitchOAuthRefresh = {
  access_token: string
  expires_in: number
  refresh_token: string
  scope: string[]
  token_type: string
}

type TTwitchValidateToken = {
  client_id: string
  login: string
  scopes: string[]
  user_id: string
  expires_in: number
}

function appUrl() {
  return process.env.APP_URL || "http://localhost:3000"
}

/** The OAuth redirect URI registered with Twitch. Must stay `<APP_URL>/api/auth`. */
export function twitchRedirectUri() {
  return `${appUrl()}/api/auth`
}

/** Port of `server/api/auth-redirect.ts` (with proper URL encoding and `state`). */
export function buildTwitchAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.API_CLIENT_ID ?? "",
    redirect_uri: twitchRedirectUri(),
    response_type: "code",
    scope: TWITCH_SCOPES.join(" "),
    state,
  })

  return `${AUTHORIZE_URL}?${params.toString()}`
}

export async function getChannelRefreshKey(
  code: string
): Promise<TOption<TTwitchOAuthRefresh>> {
  try {
    const params = new URLSearchParams({
      client_id: process.env.API_CLIENT_ID ?? "",
      client_secret: process.env.API_CLIENT_SECRET ?? "",
      code,
      grant_type: "authorization_code",
      redirect_uri: twitchRedirectUri(),
    })

    const res = await fetch(`${OAUTH_URL}?${params.toString()}`, {
      method: "POST",
      cache: "no-store",
    })

    if (!res.ok) {
      return undefined
    }

    return (await res.json()) as TTwitchOAuthRefresh
  } catch {
    return undefined
  }
}

export async function validateToken(
  token: string
): Promise<TOption<TTwitchValidateToken>> {
  try {
    const res = await fetch(VALIDATE_URL, {
      headers: { Authorization: `OAuth ${token}` },
      cache: "no-store",
    })

    if (!res.ok) {
      return undefined
    }

    return (await res.json()) as TTwitchValidateToken
  } catch {
    return undefined
  }
}
