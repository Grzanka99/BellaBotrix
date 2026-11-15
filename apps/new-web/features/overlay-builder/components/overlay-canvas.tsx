"use client"

import { useOverlayStore } from "../store"
import { OverlayElement } from "./overlay-element"

/**
 * Port of `overlay-builder/Canvas.vue`: a white canvas of the configured size
 * with a grid background, scaled by `scale`. The outer box takes the scaled
 * size so the surrounding scroll area scrolls correctly.
 */
export function OverlayCanvas() {
  const elements = useOverlayStore((s) => s.elements)
  const focused = useOverlayStore((s) => s.focused)
  const gridSize = useOverlayStore((s) => s.gridSize)
  const snapToGrid = useOverlayStore((s) => s.snapToGrid)
  const width = useOverlayStore((s) => s.canvasWidth)
  const height = useOverlayStore((s) => s.canvasHeight)
  const scale = useOverlayStore((s) => s.canvasScale) / 100

  return (
    <div
      className="m-auto shrink-0"
      style={{ width: width * scale, height: height * scale }}
    >
      <div
        data-overlay-canvas
        className="relative origin-top-left bg-white shadow-md"
        style={{
          width,
          height,
          transform: `scale(${scale})`,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${gridSize - 1}px, rgba(0, 0, 0, 0.1) ${gridSize}px),repeating-linear-gradient(90deg, transparent, transparent ${gridSize - 1}px, rgba(0, 0, 0, 0.1) ${gridSize}px)`,
        }}
      >
        {Object.entries(elements).map(([id, element]) => (
          <OverlayElement
            key={id}
            id={id}
            element={element}
            focused={focused === id}
            scale={scale}
            canvasWidth={width}
            canvasHeight={height}
            snap={snapToGrid ? gridSize : undefined}
          />
        ))}
      </div>
    </div>
  )
}
