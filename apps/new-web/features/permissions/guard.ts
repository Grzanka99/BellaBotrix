import "server-only"

import { hasPerms, type TPerms } from "@/lib/perms"
import { requireSession, type CurrentUser } from "@/lib/server/auth"

/**
 * Guard for the global (not channel-scoped) admin pages and their queries:
 * the DB-fresh user when they have ANY of `perms` (server semantics, no
 * admin shortcut), `null` otherwise. Redirects to `/login` without a session.
 *
 * Pages render `<Forbidden />` on `null` and load nothing.
 */
export async function getUserWithPerms(
  perms: TPerms[]
): Promise<CurrentUser | null> {
  const user = await requireSession()
  return hasPerms(user.perms, perms) ? user : null
}
