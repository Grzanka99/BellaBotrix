import { storage } from "shared";
import type { Store } from "sqlite-storage";

export function handleIsLive(channel: string): Store<boolean> | undefined {
  const res = storage.get<boolean>(`${channel}_is_live`);

  return res;
}
