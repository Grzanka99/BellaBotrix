import { ShieldXIcon } from "lucide-react"

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

/**
 * Rendered by a global page (admin, r6dle) when the user lacks the perms.
 * The page returns this instead of loading any data.
 */
export function Forbidden({ requirement }: { requirement: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <ShieldXIcon />
        </EmptyMedia>
        <EmptyTitle>No permission</EmptyTitle>
        <EmptyDescription>
          You don&apos;t have permission to view this page. It requires{" "}
          {requirement}.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
