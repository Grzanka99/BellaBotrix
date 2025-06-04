import { storage } from "shared";
import { CK_CHANNELS_SYNC } from "sqlite-storage";

export function HandleChannelsListUpdate() {
  const timestamp = Date.now();

  storage.set(CK_CHANNELS_SYNC, timestamp);

  return {
    timestamp,
  };
}
