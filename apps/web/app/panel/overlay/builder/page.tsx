import type { Metadata } from "next"

import { OverlayBuilder } from "@/features/overlay-builder/components/overlay-builder"

export const metadata: Metadata = {
  title: "Overlay Builder",
}

/**
 * `/panel/overlay/builder`. Purely client-side (layout in localStorage, no
 * server data); auth comes from the panel layout's `requireSession()`.
 */
export default function OverlayBuilderPage() {
  return <OverlayBuilder />
}
