"use client"

import { cn } from "cn"
import { useEffect, useRef, useState } from "react"

/**
 * How far the header must scroll back down before it expands again. Collapsing
 * shrinks the page, which can pull the scroll position back up (short pages,
 * scrolled to the bottom); without this margin that would expand the header,
 * grow the page, collapse it again, and so on.
 */
const EXPAND_HYSTERESIS_PX = 64

/**
 * Title row of a panel page: heading, optional description, actions on the
 * right. Sticks below the top bar; once the page scrolls, it collapses into a
 * single compact line (smaller title, no description) and keeps the actions
 * in reach.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: React.ReactNode
  /** Actions (buttons) rendered on the right. */
  children?: React.ReactNode
}) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const header = headerRef.current
    if (!sentinel || !header) return

    let frame = 0
    const update = () => {
      frame = 0
      // `top` of the sticky header = the height of the top bar above it.
      const stickTop = Number.parseFloat(getComputedStyle(header).top) || 0
      const sentinelTop = sentinel.getBoundingClientRect().top
      setCollapsed((was) =>
        was
          ? sentinelTop < stickTop + EXPAND_HYSTERESIS_PX
          : sentinelTop < stickTop
      )
    }
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      cancelAnimationFrame(frame)
    }
  }, [])

  // While collapsed, this header draws the backdrop for itself and the top bar
  // (see `before:` below) and the top bar hides its own, so the two read as one
  // bar with a single blur and a single bottom border.
  useEffect(() => {
    const root = document.documentElement
    root.toggleAttribute("data-page-header-collapsed", collapsed)
    return () => root.removeAttribute("data-page-header-collapsed")
  }, [collapsed])

  return (
    <>
      {/* Marks where the header sits in the flow; scrolled past = collapse. */}
      <div ref={sentinelRef} aria-hidden className="-mb-6 h-0" />
      <div
        ref={headerRef}
        data-collapsed={collapsed || undefined}
        className={cn(
          "sticky top-14 z-[9] -mx-4 flex items-end justify-between gap-4 px-4 transition-[padding] duration-200 md:-mx-6 md:px-6",
          collapsed
            ? // One backdrop from the top of the viewport (behind the top bar) to this header's bottom.
              "flex-nowrap items-center py-2 before:pointer-events-none before:absolute before:inset-x-0 before:-top-14 before:bottom-0 before:-z-10 before:border-b before:border-border before:bg-background/95 before:backdrop-blur supports-backdrop-filter:before:bg-background/80"
            : "flex-wrap bg-background"
        )}
      >
        <div className="flex min-w-0 flex-col">
          <h1
            className={cn(
              "truncate font-semibold tracking-tight transition-[font-size,line-height] duration-200",
              collapsed ? "text-base" : "text-2xl"
            )}
          >
            {title}
          </h1>
          {description && (
            <div
              className={cn(
                "grid transition-[grid-template-rows,opacity] duration-200",
                collapsed
                  ? "grid-rows-[0fr] opacity-0"
                  : "grid-rows-[1fr] opacity-100"
              )}
              aria-hidden={collapsed || undefined}
            >
              <div className="min-h-0 overflow-hidden">
                <p className="pt-1 text-sm text-muted-foreground">
                  {description}
                </p>
              </div>
            </div>
          )}
        </div>
        {children && (
          <div className="flex shrink-0 items-center gap-2">{children}</div>
        )}
      </div>
    </>
  )
}
