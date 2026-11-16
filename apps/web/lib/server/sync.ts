import "server-only"

import { after } from "next/server"

/**
 * Port of `server/utils/sync.ts`: notifies the `sup` sync service
 * (apps/sup) that the bot must reload something. Same URLs, env vars and
 * defaults as the Nuxt app; `fetch` instead of `ky`.
 *
 * Every function throws when the service is unreachable or answers non-2xx.
 * Keep the per-call-site semantics of the Nuxt code:
 *
 * - AWAITED (failure fails the request; the DB change has already happened):
 *   AI model create/update/delete (`indicateAIModelsSync`),
 *   islive (`isLive`, the dashboard turns a failure into "unknown").
 * - FIRE-AND-FORGET (failure is ignored): channel list update after the
 *   Twitch OAuth callback (`indicateChannelsListUpdate`), settings update
 *   (`indicateSettingsSync`). Use `syncInBackground(...)` for these; never
 *   call them without `await` directly (unhandled rejection).
 */

const SYNC_URL = process.env.SYNC_URL || "http://localhost:5000"
const SYNC_KEY = process.env.SYNC_KEY || "verysecurekey"
const SYNC_TIMEOUT_MS = 5000

async function syncRequest(
  path: string,
  init: { method: "GET" | "POST"; json?: unknown }
): Promise<Response> {
  const res = await fetch(`${SYNC_URL}${path}`, {
    method: init.method,
    headers:
      init.json === undefined
        ? undefined
        : { "Content-Type": "application/json" },
    body: init.json === undefined ? undefined : JSON.stringify(init.json),
    cache: "no-store",
    signal: AbortSignal.timeout(SYNC_TIMEOUT_MS),
  })

  if (!res.ok) {
    throw new Error(`Sync request ${path} failed with status ${res.status}`)
  }

  return res
}

export async function indicateSettingsSync(channel: number): Promise<void> {
  await syncRequest(`/api/v1/unsafe/${channel}/settings/sync`, {
    method: "POST",
    json: { key: SYNC_KEY },
  })
}

export async function indicateAIModelsSync(): Promise<void> {
  await syncRequest("/api/v1/unsafe/aimodels/sync", {
    method: "POST",
    json: { key: SYNC_KEY },
  })
}

/** `ch` is the Twitch channel name (`Channel.name`). */
export async function isLive(ch: string): Promise<boolean> {
  const res = await syncRequest(
    `/api/v1/unsafe/${encodeURIComponent(ch)}/islive`,
    { method: "GET" }
  )
  const json = (await res.json()) as { islive: boolean }
  return json.islive
}

export async function indicateChannelsListUpdate(): Promise<void> {
  await syncRequest("/api/v1/unsafe/channelslistupdate", { method: "GET" })
}

/**
 * Fire-and-forget a sync call from a Server Action or Route Handler. Runs
 * after the response is sent (`after()`, so serverless platforms keep the
 * function alive) and only logs failures.
 */
export function syncInBackground(label: string, task: () => Promise<void>) {
  after(async () => {
    try {
      await task()
    } catch (error) {
      console.warn(`[sync] ${label} failed:`, error)
    }
  })
}
