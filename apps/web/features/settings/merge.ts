import type { TSettings, TSettingsUpdate } from "./schema"

/**
 * Local replacement for the Nuxt PUT handler's
 *
 *   mergeWith(stored, update, (oldv, newv) =>
 *     Array.isArray(oldv) && Array.isArray(newv) ? newv : undefined)
 *
 * (`lodash.mergewith` is not a dependency of this app). Same semantics for
 * every value the settings schemas allow:
 *
 * - plain object into plain object: merged key by key, recursively. Keys
 *   only in the target are kept (so a record like
 *   `automod.emotesLimit.sanctions` can gain or change keys but never lose
 *   one, exactly like lodash).
 * - array: replaces the target value wholesale (the customizer's rule; when
 *   the target isn't an array lodash builds a fresh copy of the source,
 *   which is the same result).
 * - `undefined` in the source: the target value is kept (lodash never
 *   overwrites an existing key with `undefined`).
 * - any other value (string, number, boolean, null): replaces the target.
 *
 * Unlike lodash it does not mutate its arguments; it returns a new object
 * (the Nuxt code never reused the mutated input, so nothing depends on it).
 */
export function mergeSettings(
  target: TSettings,
  source: TSettingsUpdate
): unknown {
  return mergeValue(target, source)
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function mergeValue(target: unknown, source: unknown): unknown {
  if (source === undefined) {
    return target
  }

  if (Array.isArray(source)) {
    return source.map((item) => mergeValue(undefined, item))
  }

  if (isPlainObject(source)) {
    const result: Record<string, unknown> = isPlainObject(target)
      ? { ...target }
      : {}
    for (const [key, value] of Object.entries(source)) {
      // Source is zod-parsed (unknown keys stripped); guard anyway.
      if (value === undefined || key === "__proto__") continue
      result[key] = mergeValue(result[key], value)
    }
    return result
  }

  return source
}
