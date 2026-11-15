"use client"

import { useCurrentUser } from "@/components/current-user-provider"
import { canSeeWithPerms, type TPerms } from "@/lib/perms"
import { cn } from "@/lib/utils"

/**
 * Port of `components/auth/RequirePerms.server.vue`. UI semantics: admins
 * always pass, otherwise any of `require`, and `require={[]}` = admin only.
 *
 * Works in server and client components under `/panel` (reads the user from
 * `CurrentUserProvider`). Pass `userPerms` to use it elsewhere.
 *
 * This only changes what is rendered: children of a hidden block are still
 * sent to the browser if rendered on the server, and the matching queries /
 * actions must check perms themselves (`hasPerms`).
 */
export function RequirePerms({
  require,
  mode = "hide",
  userPerms,
  className,
  children,
}: {
  require: TPerms[]
  /** hide: render nothing. blur / block: render blurred / faded and inert. */
  mode?: "hide" | "blur" | "block"
  userPerms?: TPerms[]
  className?: string
  children: React.ReactNode
}) {
  const user = useCurrentUser()
  const perms = userPerms ?? user?.perms ?? []

  if (canSeeWithPerms(perms, require)) {
    return children
  }

  if (mode === "hide") {
    return null
  }

  return (
    <div
      inert
      aria-hidden
      className={cn(
        "pointer-events-none w-fit select-none",
        mode === "blur" ? "blur-xs" : "opacity-50",
        className
      )}
    >
      {children}
    </div>
  )
}
