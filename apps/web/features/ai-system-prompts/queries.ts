import "server-only"

import { getUserWithPerms } from "@/features/permissions/guard"
import { prisma } from "@/lib/server/db"

import type { AISystemPrompt } from "./schema"

export const aiSystemPromptSelect = {
  id: true,
  name: true,
  text: true,
  enabled: true,
  order: true,
} as const

/**
 * Port of `GET /api/admin/ai-system-prompts` (admin only), sorted by
 * `order` like the Nuxt store. `null` = no permission (nothing is read).
 */
export async function getAISystemPrompts(): Promise<AISystemPrompt[] | null> {
  const user = await getUserWithPerms(["admin"])
  if (!user) return null

  return prisma.ollamaAISetupPrompts.findMany({
    select: aiSystemPromptSelect,
    orderBy: [{ order: "asc" }, { id: "asc" }],
  })
}
