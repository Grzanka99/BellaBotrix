import type { Metadata } from "next"

import { AIModelsView } from "@/features/ai-models/components/ai-models-view"
import { getAIModels } from "@/features/ai-models/queries"
import { Forbidden } from "@/features/permissions/components/forbidden"
import { getUserWithPerms } from "@/features/permissions/guard"

export const metadata: Metadata = {
  title: "AI Models",
}

export default async function AIModelsPage() {
  // The page is admin only (Nuxt page `validate`); the list query itself
  // also allows `ai+`, the mutations are admin only.
  const admin = await getUserWithPerms(["admin"])
  if (!admin) {
    return <Forbidden requirement="the admin permission" />
  }

  const models = await getAIModels()
  if (!models) {
    return <Forbidden requirement="the admin permission" />
  }

  return <AIModelsView models={models} />
}
