import type { Metadata } from "next"

import { Forbidden } from "@/features/permissions/components/forbidden"
import { getUserWithPerms } from "@/features/permissions/guard"
import { R6dleView } from "@/features/r6dle/components/r6dle-view"
import { getR6dleOperators } from "@/features/r6dle/queries"
import { hasPerms } from "@/lib/perms"

export const metadata: Metadata = {
  title: "R6Dle Operators",
}

export default async function R6dlePage() {
  // Nuxt page `validate`: admin or r6dleadmin may open it.
  const user = await getUserWithPerms(["admin", "r6dleadmin"])
  const operators = user ? await getR6dleOperators() : null
  if (!user || !operators) {
    return <Forbidden requirement="the admin or r6dleadmin permission" />
  }

  // Mutations accept r6dleadmin only (Nuxt handlers); the actions re-check.
  const canEdit = hasPerms(user.perms, ["r6dleadmin"])

  return <R6dleView operators={operators} canEdit={canEdit} />
}
