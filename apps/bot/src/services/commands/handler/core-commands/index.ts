import type { CoreCommand } from "./core-command";
import {
  addPointsCoreCommand,
  getTopCoreCommand,
  getUserPointsCoreCommmand,
  givePointsCoreCommand,
  removePointsCoreCommand,
} from "./handlers/points.command";
import { spitCoreCommand } from "./handlers/spit.command";

export const CoreCommandsHandlers: Record<string, CoreCommand> = {
  htfu: spitCoreCommand,
  top: getTopCoreCommand,
  points: getUserPointsCoreCommmand,
  addpoints: addPointsCoreCommand,
  removepoints: removePointsCoreCommand,
  givepoints: givePointsCoreCommand,
};
