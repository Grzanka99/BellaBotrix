import { SSettings, SSettingsUpdate } from "bellatrix"
import type { TSettingOption, TSettings, TSettingsUpdate } from "bellatrix"

/**
 * The settings schemas live in the shared `bellatrix` package (the bot uses
 * them too), so they are imported, never copied. This file only adds the
 * per-field value schemas the page validates against before saving and the
 * shapes sent to the client.
 */
export { SSettings, SSettingsUpdate }
export type { TSettingOption, TSettings, TSettingsUpdate }

/** Value schemas of the editable settings (same rules as `SSettings`). */
export const SPrefixValue = SSettings.shape.commands.shape.prefix.shape.value
export const SR6dleNumberValue =
  SSettings.shape.r6dle.shape.maxPoints.shape.value
export const SNumberValue =
  SSettings.shape.points.shape.chancesOffset.shape.value
export const SStringValue = SSettings.shape.ollamaAI.shape.language.shape.value

/** Result of reading a channel's settings (Nuxt GET statuses 404 / 500 become states). */
export type ChannelSettingsResult =
  | { status: "ok"; settings: TSettings }
  /** No `WebuiUser` row owns this channel (Nuxt: 404). */
  | { status: "missing" }
  /** The stored JSON doesn't match `SSettings` (Nuxt: 500). */
  | { status: "invalid" }

/** An enabled AI model as offered by the model selector. */
export type AIModelOption = {
  name: string
  provider: string
}

/** The "list of users" textarea <-> `joinMessage.forSpecificUsers.users`. */
export function formatUsersList(users: string[]): string {
  return users.join(", ")
}

/**
 * Splits the textarea on commas. Unlike Nuxt (`value.split(",")`), entries
 * are trimmed and empty ones dropped: the bot matches names exactly, and the
 * Nuxt round trip (`join(", ")` then `split(",")`) added a leading space to
 * every name on each edit.
 */
export function parseUsersList(text: string): string[] {
  return text
    .split(",")
    .map((user) => user.trim())
    .filter((user) => user.length > 0)
}
