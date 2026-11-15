import {
  ChartColumnIcon,
  CircleAlertIcon,
  type LucideIcon,
  MessageSquareIcon,
  AlarmClockIcon,
  SettingsIcon,
} from "lucide-react"
import type { Metadata } from "next"
import Link from "next/link"
import { Suspense } from "react"

import { NoChannelEmpty } from "@/components/no-channel-empty"
import { PageHeader } from "@/components/page-header"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getLiveStatus } from "@/features/dashboard/queries"
import { getSelectedChannel } from "@/lib/server/auth"

// A layout's title template only applies to child segments, and this page
// shares the /panel segment with the layout, so the channel is added here.
export async function generateMetadata(): Promise<Metadata> {
  const channel = await getSelectedChannel()
  return {
    title: { absolute: `Dashboard - ${channel?.name ?? "BellaBotrix"}` },
  }
}

const QUICK_LINKS: { title: string; href: string; icon: LucideIcon }[] = [
  { title: "Commands", href: "/panel/commands", icon: MessageSquareIcon },
  { title: "Timers", href: "/panel/timers", icon: AlarmClockIcon },
  { title: "Stream stats", href: "/panel/stream-stats", icon: ChartColumnIcon },
  { title: "Settings", href: "/panel/settings", icon: SettingsIcon },
]

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ authfailed?: string }>
}) {
  const [{ authfailed }, channel] = await Promise.all([
    searchParams,
    getSelectedChannel(),
  ])

  return (
    <>
      <PageHeader title="Dashboard" />
      {authfailed === "true" && (
        <Alert variant="destructive">
          <CircleAlertIcon />
          <AlertTitle>Twitch authorization failed</AlertTitle>
          <AlertDescription>
            The channel could not be connected. Try authorizing again.
          </AlertDescription>
        </Alert>
      )}
      {channel ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>#{channel.name}</CardTitle>
              <CardDescription>Selected channel</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Stream status:</span>
              <Suspense fallback={<Skeleton className="h-4 w-16" />}>
                <LiveBadge channelId={channel.id} />
              </Suspense>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Quick links</CardTitle>
              <CardDescription>Jump to a channel page</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {QUICK_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  <link.icon data-icon="inline-start" />
                  {link.title}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        <NoChannelEmpty />
      )}
    </>
  )
}

async function LiveBadge({ channelId }: { channelId: number }) {
  const status = await getLiveStatus(channelId)

  if (status === "live") {
    return <Badge>Live</Badge>
  }

  if (status === "offline") {
    return <Badge variant="secondary">Offline</Badge>
  }

  return <Badge variant="outline">Unknown</Badge>
}
