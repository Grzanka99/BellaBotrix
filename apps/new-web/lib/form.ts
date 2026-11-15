import type { z } from "zod"

export type FieldErrors<T> = Partial<Record<keyof T, { message: string }[]>>

/**
 * Groups a zod `safeParse` result's issues by top-level field, in the shape
 * `<FieldError errors={errors.name} />` expects. Empty object on success.
 */
export function fieldErrors<T>(
  result: z.SafeParseReturnType<unknown, T>
): FieldErrors<T> {
  if (result.success) {
    return {}
  }

  const errors: FieldErrors<T> = {}
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof T | undefined
    if (key === undefined) continue
    errors[key] = [...(errors[key] ?? []), { message: issue.message }]
  }

  return errors
}
