import { ShieldCheckIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * Render this from a channel-scoped page when `getSelectedChannel()`
 * returns `null` (the user has no accessible channel yet).
 */
export function NoChannelEmpty() {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldCheckIcon />
        </EmptyMedia>
        <EmptyTitle>No channel yet</EmptyTitle>
        <EmptyDescription>
          Authorize your Twitch channel to manage it here, or ask a channel
          owner to give you access.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {/* Plain navigation: this is a route handler that redirects to Twitch, not a page. */}
        {/* oxlint-disable-next-line nextjs/no-html-link-for-pages */}
        <a href="/api/auth-redirect" className={buttonVariants()}>
          <ShieldCheckIcon data-icon="inline-start" />
          Authorize Twitch channel
        </a>
      </EmptyContent>
    </Empty>
  )
}
