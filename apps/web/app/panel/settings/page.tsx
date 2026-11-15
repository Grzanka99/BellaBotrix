import { CircleAlertIcon, SettingsIcon } from "lucide-react"
import type { Metadata } from "next"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { SettingsView } from "@/features/settings/components/settings-view"
import {
  getAIModelOptions,
  getChannelSettings,
} from "@/features/settings/queries"
import { getSelectedChannel } from "@/lib/server/auth"

export const metadata: Metadata = {
  title: "Settings",
}

export default async function SettingsPage() {
  const channel = await getSelectedChannel()
  if (!channel) {
    return <NoChannelEmpty />
  }

  const [result, aiModels] = await Promise.all([
    getChannelSettings(channel.id),
    getAIModelOptions(),
  ])

  if (result.status === "missing") {
    return (
      <>
        <PageHeader title="Settings" />
        <Empty className="border">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <SettingsIcon />
            </EmptyMedia>
            <EmptyTitle>No settings for this channel</EmptyTitle>
            <EmptyDescription>
              Settings are stored with the panel account that owns the channel,
              and no account owns #{channel.name} yet.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </>
    )
  }

  if (result.status === "invalid") {
    return (
      <>
        <PageHeader title="Settings" />
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Settings can&apos;t be loaded</AlertTitle>
          <AlertDescription>
            The stored settings of #{channel.name} are not in the expected
            format, so they can&apos;t be shown or changed here.
          </AlertDescription>
        </Alert>
      </>
    )
  }

  return (
    <SettingsView
      key={channel.id}
      channelId={channel.id}
      settings={result.settings}
      aiModels={aiModels}
    />
  )
}
