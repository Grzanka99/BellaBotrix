import type { Metadata } from "next"

import { Forbidden } from "@/features/permissions/components/forbidden"
import { PermissionsView } from "@/features/permissions/components/permissions-view"
import { getPermissionEntries } from "@/features/permissions/queries"

export const metadata: Metadata = {
  title: "Permissions",
}

export default async function PermissionsPage() {
  // `null` = not an admin; the query checks before reading anything.
  const entries = await getPermissionEntries()
  if (!entries) {
    return <Forbidden requirement="the admin permission" />
  }

  return <PermissionsView entries={entries} />
}
