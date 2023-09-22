import { TTwitchApiChatter } from "services/types";
import { ChatUserstate } from "tmi.js";

export function getCanRun(
  mods: TTwitchApiChatter[],
  channel: string,
  tags: ChatUserstate,
): boolean {
  if (!tags["user-id"] || !tags.username) {
    return false;
  }

  const inModsList = mods.find((m) => m.user_id === tags["user-id"]);

  if (!inModsList) {
    const isItStreamerItself = channel === `#${tags.username}`;

    return isItStreamerItself;
  }

  return true;
}
