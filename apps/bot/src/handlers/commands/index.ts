import { TUseHandler, TWithCommandHandler } from "handlers/types";
import { TwitchApi } from "services/twitch-api";
import { interpolate } from "utils/interpolate-string";
import { gamble } from "./gamble.command";
import { addPoints, getTop, getUserPoints, givePoints, removePoints } from "./points.command";
import { getUserWinrate, soloNope, soloYes, startSolo } from "./solo.command";
import { spit } from "./spit.command";
import { getCanRun } from "./utils/can-run";

export function createCommandHandler(command: TWithCommandHandler, api: TwitchApi): TUseHandler {
  return async ({ send, channel, tags, settings }): Promise<void> => {
    if (!settings) {
      return;
    }

    async function canRun(): Promise<boolean> {
      const mods = await api.getChannelModerators();
      const canRun = getCanRun(mods, channel, tags);

      return canRun;
    }

    switch (command.action) {
      case "addpoints": {
        if (!(await canRun()) || !api) {
          return;
        }

        const res = await addPoints(command, channel, tags, api);
        if (res) {
          send(res);
        }
        return;
      }
      case "removepoints": {
        if (!(await canRun()) || !api) {
          return;
        }
        const res = await removePoints(command, channel, tags, api);
        if (res) {
          send(res);
        }
        return;
      }
      case "givepoints": {
        const res = await givePoints(command, channel, tags);
        if (res) {
          send(res);
        }

        return;
      }
      case "points": {
        const res = await getUserPoints(command, channel, tags.username);
        if (res) {
          send(res);
        }
        return;
      }
      case "winrate": {
        const res = await getUserWinrate(command, channel, tags.username);
        if (res) {
          send(res);
        }

        return;
      }
      case "gamble": {
        const res = await gamble(command, channel, tags, settings);
        if (res) {
          send(res);
        }
        return;
      }
      case "solo": {
        const res = await startSolo(command, channel, tags);
        if (res) {
          send(res);
        }
        return;
      }
      case "nope": {
        const res = await soloNope(command, channel, tags);
        if (res) {
          send(res);
        }
        return;
      }
      case "yes": {
        const res = await soloYes(command, channel, tags);
        if (res) {
          send(res);
        }
        return;
      }
      case "htfu": {
        const res = await spit(command, tags, api);
        if (res) {
          send(res);
        }
        return;
      }
      case "top": {
        const res = await getTop(command, channel);
        if (res) {
          send(res);
        }
        return;
      }
      default: {
        if (!command.actionMessage || !command.actionMessage.base) {
          return;
        }

        const res = interpolate(command.actionMessage.base, {
          username: tags.username || "",
          channel,
        });

        send(res);
        return;
      }
    }
  };
}
