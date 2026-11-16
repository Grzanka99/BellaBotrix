import {
  AlarmClockIcon,
  BotIcon,
  BrainCircuitIcon,
  ChartColumnIcon,
  CpuIcon,
  CrosshairIcon,
  FlameIcon,
  LayersIcon,
  LayoutDashboardIcon,
  MessageSquareIcon,
  SettingsIcon,
  ShieldIcon,
  UserCogIcon,
  UserIcon,
  WholeWordIcon,
  type LucideIcon,
} from "lucide-react"

import type { TPerms } from "@/lib/perms"

/**
 * The panel navigation (port of `components/navbar/NavBar.server.vue`).
 * The single source of truth for sidebar links.
 *
 * `perms` uses UI semantics (`canSeeWithPerms`): undefined = everyone,
 * a list = admin or any of them, `[]` = admin only. Hiding a link is not
 * security: the page's queries and actions must check perms themselves.
 */
export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  perms?: TPerms[]
}

export type NavGroup = {
  id: "channel" | "global" | "admin" | "user"
  /** For the channel group the sidebar appends the selected channel name. */
  label: string
  perms?: TPerms[]
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "channel",
    label: "Channel",
    items: [
      { title: "dashboard", href: "/panel", icon: LayoutDashboardIcon },
      {
        title: "stream stats",
        href: "/panel/stream-stats",
        icon: ChartColumnIcon,
      },
      { title: "commands", href: "/panel/commands", icon: MessageSquareIcon },
      {
        title: "trigger words",
        href: "/panel/trigger-words",
        icon: WholeWordIcon,
      },
      { title: "solo", href: "/panel/solo", icon: FlameIcon },
      { title: "users", href: "/panel/users", icon: UserIcon },
      { title: "timers", href: "/panel/timers", icon: AlarmClockIcon },
      {
        title: "automod events",
        href: "/panel/automod-events",
        icon: BotIcon,
      },
      { title: "settings", href: "/panel/settings", icon: SettingsIcon },
      {
        title: "overlay builder",
        href: "/panel/overlay/builder",
        icon: LayersIcon,
      },
    ],
  },
  {
    id: "global",
    label: "Global settings",
    perms: ["r6dleadmin"],
    items: [
      {
        title: "r6dle",
        href: "/panel/r6dle",
        icon: CrosshairIcon,
        perms: ["r6dleadmin"],
      },
    ],
  },
  {
    id: "admin",
    label: "Admin settings",
    perms: [],
    items: [
      {
        title: "permissions",
        href: "/panel/admin/permissions",
        icon: UserCogIcon,
      },
      {
        title: "AI S. Prompts",
        href: "/panel/admin/ai/system-prompts",
        icon: BrainCircuitIcon,
      },
      { title: "AI Models", href: "/panel/admin/ai/models", icon: CpuIcon },
    ],
  },
  {
    id: "user",
    label: "User-only settings",
    items: [{ title: "access", href: "/panel/access", icon: ShieldIcon }],
  },
]

/** `/panel` matches exactly, every other link also matches its sub-routes. */
export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/panel") {
    return pathname === "/panel"
  }

  return pathname === href || pathname.startsWith(`${href}/`)
}
