import { Skeleton } from "@/components/ui/skeleton"

/**
 * Shown right away when navigating between panel pages, while the new page's
 * data loads. Generic on purpose: a title row, a toolbar and a table, which
 * is the shape of most panel pages.
 */
export default function PanelLoading() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-full max-w-sm" />
        <div className="flex flex-col gap-px overflow-hidden border">
          <Skeleton className="h-10 w-full rounded-none" />
          {Array.from({ length: 8 }, (_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-none opacity-60" />
          ))}
        </div>
      </div>
    </div>
  )
}
