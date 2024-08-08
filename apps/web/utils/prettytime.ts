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
