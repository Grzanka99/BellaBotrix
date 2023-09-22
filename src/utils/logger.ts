export const logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  warning: (msg: string) => console.log(`[WARN] ${msg}`),
  error: (msg: string) => console.log(`[ERRO] ${msg}`),
}
