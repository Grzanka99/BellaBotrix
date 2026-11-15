import type { Metadata } from "next"

import { AccessView } from "@/features/access/components/access-view"
import { getOwnChannelAccess } from "@/features/access/queries"

export const metadata: Metadata = {
  title: "Access",
}

/** Works on the user's OWN channel, not the selected one. */
export default async function AccessPage() {
  const { channel, entries } = await getOwnChannelAccess()

  return <AccessView channel={channel} entries={entries} />
}
