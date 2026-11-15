import { z } from "zod"

/**
 * URL state of the server-paginated lists (users, solo, automod events):
 * `?q=<search>&page=<n>` (+ feature specific keys such as `sort`).
 * Client-safe; shared by the three features of this chunk.
 */

export const PAGE_SIZE = 50

/** Search params as Next.js hands them to a page. */
export type RawSearchParams = Record<string, string | string[] | undefined>

/** First value of a (possibly repeated) search param. */
export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

const SQuery = z.string().trim().max(100).catch("")
const SPage = z.coerce.number().int().min(1).max(1_000_000).catch(1)

export type ListParams = {
  /** Trimmed search text, "" = no filter. */
  q: string
  /** 1-based page number. */
  page: number
}

/** Lenient parse: invalid values fall back to defaults instead of erroring. */
export function parseListParams(raw: RawSearchParams): ListParams {
  return {
    q: SQuery.parse(firstParam(raw.q) ?? ""),
    page: SPage.parse(firstParam(raw.page) ?? 1),
  }
}

/** A page of rows plus what the pagination needs. */
export type Paginated<T> = {
  rows: T[]
  /** Rows matching the search (all pages). */
  total: number
  page: number
  pageSize: number
}

export function pageCount(total: number, pageSize: number) {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** Clamps a requested page to the existing range (e.g. after the list shrank). */
export function clampPage(page: number, total: number, pageSize: number) {
  return Math.min(page, pageCount(total, pageSize))
}
