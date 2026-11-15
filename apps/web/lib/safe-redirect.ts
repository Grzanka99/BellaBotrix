/**
 * Returns `next` only when it is a same-origin relative path inside the
 * panel, otherwise `/panel`. Use for any user-supplied "redirect back to" value.
 */
export function safePanelPath(next: unknown): string {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.includes("\\")
  ) {
    return "/panel"
  }

  try {
    const base = "http://internal.invalid"
    const url = new URL(next, base)

    if (url.origin !== base) {
      return "/panel"
    }

    if (url.pathname !== "/panel" && !url.pathname.startsWith("/panel/")) {
      return "/panel"
    }

    return `${url.pathname}${url.search}`
  } catch {
    return "/panel"
  }
}
