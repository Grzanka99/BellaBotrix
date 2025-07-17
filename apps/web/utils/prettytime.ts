export function fromNS(ns: number | string): string {
  const timestamp = Number(ns);
  const date = new Date(timestamp);

  let hours = String(date.getHours());
  let minutes = String(date.getMinutes());
  let seconds = String(date.getSeconds());

  hours = hours.length === 1 ? `${0}${hours}` : hours;
  minutes = minutes.length === 1 ? `${0}${minutes}` : minutes;
  seconds = seconds.length === 1 ? `${0}${seconds}` : seconds;

  return `${hours}:${minutes}:${seconds}`;
}

export function formatYearMonth(ym: string) {
  const [year, month] = ym.split("-").map(Number);

  const date = new Date(year, month - 1, 1);

  const dtf = new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
  });

  const parts = dtf.formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;

  return `${y} ${m}`;
}
export function formatDayTime(iso: string) {
  const d = new Date(iso);
  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const time = d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${day} at ${time}`;
}
