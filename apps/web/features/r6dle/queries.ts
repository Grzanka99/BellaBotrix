import "server-only"

import { getUserWithPerms } from "@/features/permissions/guard"
import { prisma } from "@/lib/server/db"

import type { R6dleOperator } from "./schema"

type OperatorRow = {
  id: number
  enabled: boolean
  gender: string
  name: string
  role: string
  side: string
  country: string
  region: string
  org: string
  squad: string
  release: number
  speed: number
}

/** Port of the Nuxt mapping: `role` is stored comma separated. */
export function toOperator(row: OperatorRow): R6dleOperator {
  return { ...row, role: row.role.split(",") } as R6dleOperator
}

/**
 * Port of `GET /api/r6dle/operators`. The Nuxt endpoint had no auth at all;
 * here it is limited to who may open the page (Nuxt page `validate`:
 * `admin` or `r6dleadmin`). `null` = no permission (nothing is read).
 */
export async function getR6dleOperators(): Promise<R6dleOperator[] | null> {
  const user = await getUserWithPerms(["admin", "r6dleadmin"])
  if (!user) return null

  const rows = await prisma.r6DleOperators.findMany({ orderBy: { id: "asc" } })
  return rows.map(toOperator)
}
