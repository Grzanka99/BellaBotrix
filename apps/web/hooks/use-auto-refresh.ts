"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

/**
 * Re-fetches the current route's server components every `intervalMs`
 * while the tab is visible (replaces the Nuxt stores' `setInterval(refresh)`).
 * Also refreshes once when the tab becomes visible again. Fresh server props
 * then flow into the feature's store via `createStoreContext`'s `sync`.
 */
export function useAutoRefresh(intervalMs = 10_000, enabled = true) {
  const router = useRouter()

  useEffect(() => {
    if (!enabled) return

    const refreshIfVisible = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }

    const timer = window.setInterval(refreshIfVisible, intervalMs)
    document.addEventListener("visibilitychange", refreshIfVisible)

    return () => {
      window.clearInterval(timer)
      document.removeEventListener("visibilitychange", refreshIfVisible)
    }
  }, [router, intervalMs, enabled])
}
