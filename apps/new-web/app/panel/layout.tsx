import type { Metadata } from "next"
import { cookies } from "next/headers"

import { CurrentUserProvider } from "@/components/current-user-provider"
import { AppSidebar } from "@/components/panel/app-sidebar"
import { ChannelSwitcher } from "@/components/panel/channel-switcher"
import { ThemeToggle } from "@/components/panel/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  getAccessibleChannels,
  getSelectedChannel,
  requireSession,
} from "@/lib/server/auth"

/** Page titles become `<page> - <channel>`, like the Nuxt panel layout. */
export async function generateMetadata(): Promise<Metadata> {
  const channel = await getSelectedChannel()

  return {
    title: {
      template: `%s - ${channel ? channel.name : "BellaBotrix"}`,
      default: "Panel",
    },
  }
}

export default async function PanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireSession()
  const [channels, selected, cookieStore] = await Promise.all([
    getAccessibleChannels(),
    getSelectedChannel(),
    cookies(),
  ])
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"
  const isAdmin = user.perms.includes("admin")

  return (
    <CurrentUserProvider
      user={{ id: user.id, username: user.username, perms: user.perms }}
    >
      <SidebarProvider defaultOpen={sidebarOpen}>
        <AppSidebar channelName={selected?.name ?? null} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <ChannelSwitcher
              channels={channels.map(({ id, name }) => ({ id, name }))}
              selectedId={selected?.id ?? null}
            />
            <div className="ml-auto flex items-center gap-3">
              {isAdmin && (
                <div className="hidden flex-wrap items-center gap-2 md:flex">
                  {user.perms.map((perm) => (
                    <Badge key={perm} variant="secondary">
                      {perm}
                    </Badge>
                  ))}
                </div>
              )}
              <ThemeToggle />
            </div>
          </header>
          {/* A page can opt out of the padding with `data-page-bleed`. */}
          <div className="flex flex-1 flex-col gap-6 p-4 has-[[data-page-bleed]]:p-0 md:p-6">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </CurrentUserProvider>
  )
}
