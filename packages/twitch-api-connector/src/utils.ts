import { API_CLIENT_ID } from "env";

type TReplacingKeys = Record<string, string | number>;

export function interpolate(base: string, args: TReplacingKeys) {
  if (!base.includes("$")) return base;
  if (!args) return base;

  let newString: string = base;
  // biome-ignore lint/complexity/noForEach: <explanation>
  Object.entries(args).forEach(([key, value]) => {
    newString = newString.replaceAll(`$${key}`, String(value));
  });

  return newString;
}

const time = (): string => {
  const date = new Date();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

export const logger = {
  info: (msg: string) => console.log(`${time()} [INFO] [TTV_API_CONNECTOR] ${msg}`),
  warning: (msg: string) => console.log(`${time()} [WARN] [TTV_API_CONNECTOR] ${msg}`),
  error: (msg: string) => console.log(`${time()} [ERRO] [TTV_API_CONNECTOR] ${msg}`),
  message: (msg: string) => console.log(`${time()} [MESG] [TTV_API_CONNECTOR] ${msg}`),
};

export const URL_ENCODED_PARAMS = {
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
};

export const bearerTokenParams = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Client-Id": API_CLIENT_ID,
  },
});
