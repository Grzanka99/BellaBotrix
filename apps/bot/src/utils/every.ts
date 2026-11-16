// NOTE: setInterval owned by a signal; returns undefined (and starts nothing) if already aborted
export function every(ms: number, fn: () => void, signal: AbortSignal): Timer | undefined {
  if (signal.aborted) {
    return undefined;
  }

  const timer = setInterval(fn, ms);
  signal.addEventListener("abort", () => clearInterval(timer), { once: true });
  return timer;
}
