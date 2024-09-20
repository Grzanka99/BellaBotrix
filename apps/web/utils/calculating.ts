export function sumarr(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0);
}

export function avarage(arr: number[]): number {
  return arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
}

export function roundtoprecision(num: number, decimal = 2): number {
  return Math.round(num * 10 ** decimal) / 10 ** decimal;
}
