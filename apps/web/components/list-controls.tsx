"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState, useTransition } from "react"

import { SearchInput } from "@/components/search-input"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"

import { pageCount } from "@/lib/list-params"

/**
 * URL-driven list controls shared by the users, solo and automod-events
 * pages: the search text and the page number live in `searchParams`, so the
 * server component reads them and queries only one page.
 */

/** Builds `pathname?…` from the current params with `patch` applied (null deletes). */
function useHrefBuilder() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(patch)) {
      if (value === null || value === "") next.delete(key)
      else next.set(key, value)
    }
    const query = next.toString()
    return query ? `${pathname}?${query}` : pathname
  }
}

/** Navigates to the current URL with `patch` applied, resetting `page`. */
export function useListNavigation() {
  const router = useRouter()
  const buildHref = useHrefBuilder()
  const [pending, startTransition] = useTransition()

  function navigate(patch: Record<string, string | null>) {
    startTransition(() => {
      router.replace(buildHref({ page: null, ...patch }), { scroll: false })
    })
  }

  return { navigate, pending }
}

/** Search box bound to `?q=`, debounced (300 ms); a new search goes back to page 1. */
export function UrlSearchInput({
  placeholder,
  debounceMs = 300,
}: {
  placeholder: string
  debounceMs?: number
}) {
  const searchParams = useSearchParams()
  const urlValue = searchParams.get("q") ?? ""
  const [value, setValue] = useState(urlValue)
  const { navigate, pending } = useListNavigation()
  const timer = useRef<number | undefined>(undefined)

  // Follow external URL changes (back / forward) when the user isn't typing.
  const [lastUrlValue, setLastUrlValue] = useState(urlValue)
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue)
    if (timer.current === undefined) setValue(urlValue)
  }

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function onChange(next: string) {
    setValue(next)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      timer.current = undefined
      if (next.trim() !== urlValue) navigate({ q: next.trim() || null })
    }, debounceMs)
  }

  return (
    <div className="flex items-center gap-2">
      <SearchInput
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {pending && <Spinner className="text-muted-foreground" />}
    </div>
  )
}

/** Page numbers to show: first, last, and a window around the current page. */
function pageWindow(current: number, total: number): (number | "gap")[] {
  const pages = new Set([1, total, current - 1, current, current + 1])
  const sorted = [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b)
  const result: (number | "gap")[] = []
  for (const page of sorted) {
    const prev = result[result.length - 1]
    if (typeof prev === "number" && page - prev > 1) result.push("gap")
    result.push(page)
  }
  return result
}

/** shadcn Pagination bound to `?page=`; client-side navigation, scroll kept. */
export function UrlPagination({
  page,
  pageSize,
  total,
}: {
  page: number
  pageSize: number
  total: number
}) {
  const router = useRouter()
  const buildHref = useHrefBuilder()
  const pages = pageCount(total, pageSize)
  if (pages <= 1) return null

  function linkProps(target: number) {
    const href = buildHref({ page: target === 1 ? null : String(target) })
    return {
      href,
      onClick: (event: React.MouseEvent<HTMLAnchorElement>) => {
        if (event.metaKey || event.ctrlKey || event.shiftKey) return
        event.preventDefault()
        router.push(href, { scroll: false })
      },
    }
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            {...linkProps(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={page <= 1 ? "pointer-events-none opacity-50" : undefined}
          />
        </PaginationItem>
        {pageWindow(page, pages).map((item, index) =>
          item === "gap" ? (
            <PaginationItem key={`gap-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink {...linkProps(item)} isActive={item === page}>
                {item}
              </PaginationLink>
            </PaginationItem>
          )
        )}
        <PaginationItem>
          <PaginationNext
            {...linkProps(Math.min(pages, page + 1))}
            aria-disabled={page >= pages}
            className={
              page >= pages ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

/** "Showing 51–100 of 1,791" line under a paginated table. */
export function RangeSummary({
  page,
  pageSize,
  total,
  noun,
}: {
  page: number
  pageSize: number
  total: number
  noun: string
}) {
  if (total === 0) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <p className="text-sm text-muted-foreground tabular-nums">
      Showing {from.toLocaleString("en-US")}–{to.toLocaleString("en-US")} of{" "}
      {total.toLocaleString("en-US")} {noun}
    </p>
  )
}
