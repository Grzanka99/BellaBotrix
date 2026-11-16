import { hasPerms, type TPerms } from "@/lib/perms"

import type { TSettingsUpdate } from "./schema"

/** Who may change which perms-gated settings (server semantics, `hasPerms`). */
export const AI_SETTINGS_PERMS: TPerms[] = ["ai", "ai+", "admin"]
export const AI_PLUS_SETTINGS_PERMS: TPerms[] = ["ai+", "admin"]
export const AUTOMOD_SETTINGS_PERMS: TPerms[] = ["automod", "admin"]

/**
 * Port of `alterSettingsForNonAIUser` (Nuxt PUT handler), plus the automod
 * gate the Nuxt page only applied in the UI. Disallowed parts of the update
 * are dropped silently, like Nuxt does, so the stored values stay unchanged:
 *
 * - without `ai` / `ai+` / `admin`: the whole `ollamaAI` update is dropped;
 * - without `ai+` / `admin`: `ollamaAI.model` and `ollamaAI.keepHistory`
 *   are dropped, the rest of `ollamaAI` is kept;
 * - without `automod` / `admin`: the whole `automod` update is dropped.
 */
export function restrictSettingsUpdate(
  data: TSettingsUpdate,
  perms: TPerms[]
): TSettingsUpdate {
  let result = data

  if (result.ollamaAI) {
    if (!hasPerms(perms, AI_SETTINGS_PERMS)) {
      result = { ...result, ollamaAI: undefined }
    } else if (
      (result.ollamaAI.model !== undefined ||
        result.ollamaAI.keepHistory !== undefined) &&
      !hasPerms(perms, AI_PLUS_SETTINGS_PERMS)
    ) {
      result = {
        ...result,
        ollamaAI: {
          ...result.ollamaAI,
          model: undefined,
          keepHistory: undefined,
        },
      }
    }
  }

  if (result.automod && !hasPerms(perms, AUTOMOD_SETTINGS_PERMS)) {
    result = { ...result, automod: undefined }
  }

  return result
}
