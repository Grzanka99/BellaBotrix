import { TOption } from "bellatrix";
import { TTwitchIrcSource } from "services/types";

export function parseSourceComponent(rawSource: TOption<string>): TOption<TTwitchIrcSource> {
  if (!rawSource) {
    return undefined;
  }

  const sourceParts = rawSource.split("!");

  return {
    username: sourceParts.length === 2 ? sourceParts[0] : undefined,
    host: sourceParts.length === 2 ? sourceParts[1] : sourceParts[0],
  };
}
