import { z } from "zod"

import { avarage, roundtoprecision, sumarr } from "@/lib/calculating"

/**
 * Types and pure computations of the stream stats page (port of
 * `composables/stream-stats.ts` and `components/stream-stats/chart.vue`).
 * Client-safe.
 */

/** `?stream=<Streams.id>`; anything else means "the latest stream". */
export const SStreamParam = z.coerce
  .number()
  .int()
  .positive()
  .optional()
  .catch(undefined)

export type LiveStatus = "live" | "offline" | "unknown"

/** A stream of the channel as listed in the picker. */
export type StreamSummary = {
  id: number
  /** ISO string (`Streams.started_at`). */
  startedAt: string
  /** `YYYY-MM` (first 7 chars of `started_at`, like `takeMonths`). */
  month: string
  live: boolean
  /** Average viewers of the stream; null when there's no data (Nuxt: database-off icon). */
  avgViewers: number | null
}

export type MonthSummary = {
  /** `YYYY-MM`. */
  month: string
  /** Average viewers over every sample of the month's streams; null without data. */
  avgViewers: number | null
}

export type StreamsOverview = {
  /** Newest first (`orderBy started_at desc`). */
  streams: StreamSummary[]
  /** Newest first, in the order they first appear in `streams`. */
  months: MonthSummary[]
}

/** One `StreamStats` row (the columns the page uses). */
export type StatSample = {
  /** Milliseconds since epoch. */
  timestamp: number
  viewers: number
  messages: number
  follows: number
  subscribers: number
  newChatters: number
}

/** Port of `streamData` in the composable (header numbers). */
export type StreamData = {
  avgViewers: number
  maxViewers: number
  /** Average messages per sample (samples are taken every 30 s). */
  avgMsg: number
  totalMsg: number
}

export type SelectedStreamStats = {
  stream: StreamSummary
  /** Raw number of `StreamStats` rows of the stream. */
  samples: number
  data: StreamData
  /** Chart points after the Nuxt bucket reduction. */
  points: StatSample[]
}

export function computeStreamData(samples: StatSample[]): StreamData {
  const viewers = samples.map((sample) => sample.viewers)
  const messages = samples.map((sample) => sample.messages)

  return {
    avgViewers: roundtoprecision(avarage(viewers)),
    maxViewers: Math.max(...viewers),
    avgMsg: roundtoprecision(avarage(messages)),
    totalMsg: sumarr(messages),
  }
}

/**
 * Port of `reducedStats` in `chart.vue`: samples are bucketed by
 * `round(timestamp / (count * 500))`; a bucket keeps its first sample with
 * the messages of the whole bucket summed. (Follows, subscribers and new
 * chatters, which the Nuxt chart didn't plot, are summed the same way.)
 */
export function reduceSamples(samples: StatSample[]): StatSample[] {
  if (samples.length === 0) return []

  const divider = Math.round(Math.round(samples.length) * 500)
  const buckets = new Map<number, StatSample>()

  for (const sample of samples) {
    const key = Math.round(sample.timestamp / divider)
    const value = buckets.get(key)

    if (value) {
      buckets.set(key, {
        ...value,
        messages: value.messages + sample.messages,
        follows: value.follows + sample.follows,
        subscribers: value.subscribers + sample.subscribers,
        newChatters: value.newChatters + sample.newChatters,
      })
    } else {
      buckets.set(key, sample)
    }
  }

  return Array.from(buckets.values())
}

/** Nuxt `avgViewers.vue` formatting: two decimals, nothing for missing / 0. */
export function formatAvg(value: number | null): string | undefined {
  return value ? value.toFixed(2) : undefined
}

/**
 * The stream `?stream=` points at. It must be one of the channel's streams;
 * without the parameter it is the latest one.
 */
export function pickStream(
  overview: StreamsOverview,
  requested: number | undefined
): StreamSummary | undefined {
  return requested === undefined
    ? overview.streams[0]
    : overview.streams.find((stream) => stream.id === requested)
}
