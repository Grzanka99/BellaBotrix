/** Port of `utils/prettytime.ts`. */

/** Millisecond timestamp (number or numeric string) to local `HH:MM:SS`. */
export function fromNS(ns: number | string): string {
  const date = new Date(Number(ns))
  const pad = (value: number) => String(value).padStart(2, "0")

  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** `"2024-05"` to e.g. `"2024 May"` in the user's locale. */
export function formatYearMonth(ym: string): string {
  const [year, month] = ym.split("-").map(Number)
  const date = new Date(year, month - 1, 1)

  const parts = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
  }).formatToParts(date)
  const y = parts.find((part) => part.type === "year")?.value
  const m = parts.find((part) => part.type === "month")?.value

  return `${y} ${m}`
}

/** ISO date to e.g. `"05 at 14:03:22"` (day of month + 24h time). */
export function formatDayTime(iso: string): string {
  const date = new Date(iso)
  const day = date.toLocaleDateString(undefined, { day: "2-digit" })
  const time = date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })

  return `${day} at ${time}`
}
