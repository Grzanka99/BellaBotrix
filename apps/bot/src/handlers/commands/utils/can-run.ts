import { TTwitchApiChatter, TTwitchMessageInfo } from "services/types";

export function getCanRun(
  mods: TTwitchApiChatter[],
  channel: string,
  tags: TTwitchMessageInfo,
): boolean {
  if (!tags.userId || !tags.username) {
    return false;
  }

  const inModsList = mods.find((m) => m.user_id === tags.userId);

  if (!inModsList) {
    const isItStreamerItself = channel === `#${tags.username}`;

    return isItStreamerItself;
  }

  return true;
}
