/**
 * Port of `store/7tv-integration.store.ts` (the data half) and
 * `types/emote-integration.type.ts`. Client-side only: the 7TV API
 * is public, and the browser calls it directly like the Nuxt store did.
 *
 * Anything that goes wrong (network, non-2xx, unexpected JSON) yields an
 * empty map, so messages simply render as plain text.
 */

/** Emote images are only ever loaded from this host (see `emoteImageUrl`). */
const SEVEN_TV_CDN_HOST = "cdn.7tv.app"

type SevenTVFile = {
  name?: unknown
}

type SevenTVSingleEmote = {
  name?: unknown
  data?: {
    host?: {
      url?: unknown
      files?: SevenTVFile[]
    }
  }
}

/** Emote name -> absolute image URL on the 7TV CDN. */
export type EmoteMap = ReadonlyMap<string, string>

const EMPTY: EmoteMap = new Map()

/**
 * Builds the image URL the Nuxt store built (`<host.url>/<files[1].name>`,
 * the 2x image) and returns it only if it really points at the 7TV CDN over
 * https. Host URLs come back protocol-relative (`//cdn.7tv.app/emote/<id>`).
 */
export function emoteImageUrl(emote: SevenTVSingleEmote): string | null {
  const host = emote.data?.host
  const files = Array.isArray(host?.files) ? host.files : []
  const file = files[1] ?? files[0]
  if (typeof host?.url !== "string" || typeof file?.name !== "string") {
    return null
  }

  try {
    const base = new URL(
      host.url.startsWith("//") ? `https:${host.url}` : host.url
    )
    if (base.protocol !== "https:" || base.hostname !== SEVEN_TV_CDN_HOST) {
      return null
    }
    const url = new URL(
      `${base.pathname.replace(/\/+$/, "")}/${encodeURIComponent(file.name)}`,
      base.origin
    )
    return url.hostname === SEVEN_TV_CDN_HOST ? url.href : null
  } catch {
    return null
  }
}

async function loadEmotes(twitchChannelId: string): Promise<EmoteMap> {
  try {
    const res = await fetch(
      `https://7tv.io/v3/users/twitch/${encodeURIComponent(twitchChannelId)}`
    )
    if (!res.ok) return EMPTY

    const json: unknown = await res.json()
    const emotes = (json as { emote_set?: { emotes?: unknown } } | null)
      ?.emote_set?.emotes
    if (!Array.isArray(emotes)) return EMPTY

    const map = new Map<string, string>()
    for (const emote of emotes as SevenTVSingleEmote[]) {
      if (typeof emote?.name !== "string" || !emote.name) continue
      const url = emoteImageUrl(emote)
      if (url) map.set(emote.name, url)
    }
    return map
  } catch {
    return EMPTY
  }
}

/**
 * One request per Twitch channel per page load (the Nuxt store also fetched
 * once). Public data only, so a module-level cache in the browser is fine.
 */
const cache = new Map<string, Promise<EmoteMap>>()

export function getSevenTvEmotes(twitchChannelId: string): Promise<EmoteMap> {
  let pending = cache.get(twitchChannelId)
  if (!pending) {
    pending = loadEmotes(twitchChannelId)
    cache.set(twitchChannelId, pending)
  }
  return pending
}

/** Splits a message like the Nuxt `MessageWithEmotes` (on single spaces). */
export type MessagePart =
  { kind: "text"; text: string } | { kind: "emote"; name: string; src: string }

export function splitMessage(message: string, emotes: EmoteMap): MessagePart[] {
  return message.split(" ").map((word) => {
    const src = emotes.get(word)
    return src
      ? { kind: "emote", name: word, src }
      : { kind: "text", text: word }
  })
}
