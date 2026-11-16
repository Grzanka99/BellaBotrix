"use client"

import { toast } from "@/components/ui/toast"
import type { ActionFailure } from "@/lib/action-result"

/**
 * User feedback (replaces the Nuxt `popups.store`). Client components only.
 * Errors stay on screen longer than successes, like the Nuxt popups.
 */
export function notifySuccess(title: string, description?: string) {
  toast.add({ title, description, type: "success", timeout: 3000 })
}

export function notifyError(title: string, description?: string) {
  toast.add({ title, description, type: "error", timeout: 8000 })
}

/** Toast for a failed `ActionResult`: `title` (Nuxt wording) + the server's message. */
export function notifyActionError(title: string, failure: ActionFailure) {
  notifyError(title, failure.error)
}
