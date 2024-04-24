import type { CoreCommand } from "./core-command";
import { gambleCoreCommand } from "./handlers/gamble.command";
import {
  addPointsCoreCommand,
  getTopCoreCommand,
  getUserPointsCoreCommmand,
  givePointsCoreCommand,
  removePointsCoreCommand,
} from "./handlers/points.command";
import {
  getUserWinrateCoreCommand,
  soloNopeCoreCommand,
  soloYesCoreCommand,
  startSoloCoreCommand,
} from "./handlers/solo.command";
import { spitCoreCommand } from "./handlers/spit.command";

export const CoreCommandsHandlers: Record<string, CoreCommand> = {
  htfu: spitCoreCommand,
  top: getTopCoreCommand,
  points: getUserPointsCoreCommmand,
  addpoints: addPointsCoreCommand,
  removepoints: removePointsCoreCommand,
  givepoints: givePointsCoreCommand,
  solo: startSoloCoreCommand,
  yes: soloYesCoreCommand,
  nope: soloNopeCoreCommand,
  winrate: getUserWinrateCoreCommand,
  gamble: gambleCoreCommand,
};
