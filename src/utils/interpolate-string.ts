type TReplacingKeys = Record<string, string | number>;

export function interpolate(base: string, args: TReplacingKeys) {
  if (!base.includes("$")) return base;
  if (!args) return base;

  let newString: string = base;
  Object.entries(args).forEach(([key, value]) => {
    newString = newString.replaceAll(`$${key}`, String(value));
  });

  return newString;
}
