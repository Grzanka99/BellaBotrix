"use client"

import { createStoreContext } from "@/lib/create-store-context"
import { notifyActionError } from "@/lib/notify"

import { updateSettings } from "./actions"
import { mergeSettings } from "./merge"
import type { AIModelOption, TSettings, TSettingsUpdate } from "./schema"

/** Port of `store/settings.store.ts` (client half). */

export type SettingsProps = {
  channelId: number
  settings: TSettings
  aiModels: AIModelOption[]
}

type SettingsState = {
  channelId: number
  /** Server data; replaced by fresh props and by every save's result. */
  settings: TSettings
  aiModels: AIModelOption[]
  /**
   * Saves a partial update (Nuxt `handleUpdate`). The change is applied
   * optimistically and rolled back on failure. Resolves to `true` on success.
   */
  save: (update: TSettingsUpdate) => Promise<boolean>
}

export const settingsStore = createStoreContext<SettingsState, SettingsProps>({
  name: "SettingsStore",
  create: (props) => (set, get) => ({
    channelId: props.channelId,
    settings: props.settings,
    aiModels: props.aiModels,
    save: async (update) => {
      const previous = get().settings
      set({ settings: mergeSettings(previous, update) as TSettings })

      const result = await updateSettings(get().channelId, update)
      if (!result.ok) {
        set({ settings: previous })
        notifyActionError("Error occurred while updating settings", result)
        return false
      }

      set({ settings: result.data })
      return true
    },
  }),
  sync: (props) => ({
    channelId: props.channelId,
    settings: props.settings,
    aiModels: props.aiModels,
  }),
})
