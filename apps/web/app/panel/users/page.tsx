import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { UsersView } from "@/features/users/components/users-view"
import {
  firstParam,
  parseListParams,
  type RawSearchParams,
} from "@/lib/list-params"
import { getChattersPage } from "@/features/users/queries"
import { SChatterSort } from "@/features/users/schema"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Users",
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const raw = await searchParams
  const sort = SChatterSort.parse(firstParam(raw.sort))
  const data = await getChattersPage(channel.id, {
    ...parseListParams(raw),
    sort,
  })

  return (
    <UsersView
      key={channel.id}
      channelId={channel.id}
      data={data}
      sort={sort}
    />
  )
}
