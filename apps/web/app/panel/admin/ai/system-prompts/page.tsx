import type { Metadata } from "next"

import { AISystemPromptsView } from "@/features/ai-system-prompts/components/ai-system-prompts-view"
import { getAISystemPrompts } from "@/features/ai-system-prompts/queries"
import { Forbidden } from "@/features/permissions/components/forbidden"

export const metadata: Metadata = {
  title: "AI System Prompts",
}

export default async function AISystemPromptsPage() {
  // `null` = not an admin; the query checks before reading anything.
  const prompts = await getAISystemPrompts()
  if (!prompts) {
    return <Forbidden requirement="the admin permission" />
  }

  return <AISystemPromptsView prompts={prompts} />
}
