import "server-only"

import { prisma } from "@/lib/server/db"

import { getUserWithPerms } from "@/features/permissions/guard"
import type { AIModel } from "./schema"

export const aiModelSelect = {
  id: true,
  name: true,
  description: true,
  provider: true,
  enabled: true,
} as const

/**
 * Port of `GET /api/admin/ai-models`: `admin` or `ai+` may list models.
 * `null` = no permission (nothing is read).
 */
export async function getAIModels(): Promise<AIModel[] | null> {
  const user = await getUserWithPerms(["admin", "ai+"])
  if (!user) return null

  return prisma.ollamaAIModels.findMany({
    select: aiModelSelect,
    orderBy: { id: "asc" },
  })
}
