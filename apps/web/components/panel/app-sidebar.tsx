"use client"

import {
  BotIcon,
  ChevronsUpDownIcon,
  CircleUserIcon,
  LogOutIcon,
  ShieldCheckIcon,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTransition } from "react"

import { useCurrentUser } from "@/components/current-user-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { logout } from "@/features/auth/actions"
import { isNavItemActive, NAV_GROUPS } from "@/lib/nav"
import { canSeeWithPerms } from "@/lib/perms"

/** Port of `components/navbar/NavBar.server.vue`. Links come from `lib/nav.ts`. */
export function AppSidebar({ channelName }: { channelName: string | null }) {
  const pathname = usePathname()
  const user = useCurrentUser()
  const perms = user?.perms ?? []

  const groups = NAV_GROUPS.filter(
    (group) => !group.perms || canSeeWithPerms(perms, group.perms)
  )

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/panel" />}>
              {/* The square fills the collapsed (icon-only) button, so the name is clipped away. */}
              <div className="flex aspect-square size-8 items-center justify-center">
                <BotIcon />
              </div>
              <span className="truncate font-semibold">BellaBotrix</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((group) => (
          <SidebarGroup key={group.id}>
            <SidebarGroupLabel>
              {group.id === "channel" && channelName
                ? `${group.label}: #${channelName}`
                : group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items
                  .filter(
                    (item) => !item.perms || canSeeWithPerms(perms, item.perms)
                  )
                  .map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isNavItemActive(item.href, pathname)}
                        tooltip={item.title}
                        render={<Link href={item.href} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser username={user?.username ?? ""} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

function NavUser({ username }: { username: string }) {
  const [pending, startTransition] = useTransition()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<SidebarMenuButton size="lg" />}
            disabled={pending}
          >
            <div className="flex aspect-square size-8 items-center justify-center">
              <CircleUserIcon />
            </div>
            <span className="flex min-w-0 flex-1 flex-col text-left">
              <span className="truncate font-medium">{username}</span>
              <span className="truncate text-xs text-muted-foreground">
                Account
              </span>
            </span>
            <ChevronsUpDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="min-w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{username}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              {/* Plain navigation: the route handler redirects to Twitch. */}
              <DropdownMenuItem render={<a href="/api/auth-redirect" />}>
                <ShieldCheckIcon />
                Authorize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => startTransition(() => logout())}>
                <LogOutIcon />
                Logout
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
