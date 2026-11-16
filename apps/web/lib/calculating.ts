/** Port of `utils/calculating.ts` (names kept for easy porting). */

export function sumarr(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0)
}

/** Arithmetic mean; `NaN` for an empty array (same as the Nuxt version). */
export function avarage(arr: number[]): number {
  return sumarr(arr) / arr.length
}

export function roundtoprecision(num: number, decimal = 2): number {
  return Math.round(num * 10 ** decimal) / 10 ** decimal
}
