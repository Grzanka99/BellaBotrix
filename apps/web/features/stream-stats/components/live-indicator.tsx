import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

import type { LiveStatus } from "../schema"

const LABELS: Record<LiveStatus, string> = {
  live: "live",
  offline: "offline",
  unknown: "status unknown",
}

/**
 * Port of `components/dashboard/isLiveIcon.vue`: pulsing red dot when live,
 * grey otherwise. "unknown" = the sync service couldn't be reached.
 */
export function LiveIndicator({ status }: { status: LiveStatus }) {
  const live = status === "live"
  return (
    <Badge
      variant="outline"
      title={
        status === "unknown" ? "Couldn't reach the bot to check" : undefined
      }
    >
      <span className="relative flex size-2.5" aria-hidden>
        {live && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-red-500 opacity-60" />
        )}
        <span
          className={cn(
            "relative inline-flex size-2.5 rounded-full",
            live ? "bg-red-500" : "bg-muted-foreground"
          )}
        />
      </span>
      {LABELS[status]}
    </Badge>
  )
}
