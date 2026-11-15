"use client"

import { createContext, useContext } from "react"

import type { TPerms } from "@/lib/perms"

/** What client components may know about the logged-in user. */
export type ClientUser = {
  id: number
  username: string
  perms: TPerms[]
}

const CurrentUserContext = createContext<ClientUser | null>(null)

/** Mounted by `app/panel/layout.tsx` with the DB-fresh user. */
export function CurrentUserProvider({
  user,
  children,
}: {
  user: ClientUser
  children: React.ReactNode
}) {
  return <CurrentUserContext value={user}>{children}</CurrentUserContext>
}

/** The logged-in user inside `/panel`, `null` outside of it. */
export function useCurrentUser(): ClientUser | null {
  return useContext(CurrentUserContext)
}
