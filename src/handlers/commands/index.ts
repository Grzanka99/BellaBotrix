import { TWithCommandHandler, TUseHandler } from "handlers/types";
import { addPoints, getUserPoints, givePoints, removePoints } from "./points.command";
import { interpolate } from "utils/interpolate-string";
import { gamble } from "./gamble.command";
import { TwitchApi } from "services/twitch-api";
import { getUserWinrate, soloNope, soloYes, startSolo } from "./solo.command";
import { getCanRun } from "./utils/can-run";
import { spit } from "./spit.command";

export function createCommandHandler(command: TWithCommandHandler, api: TwitchApi): TUseHandler {
  return async function ({ client, channel, tags, settings }): Promise<void> {
    if (!settings) {
      return;
    }

    const mods = await api.getChannelModerators();
    const canRun = getCanRun(mods, channel, tags);

    switch (command.action) {
      case "addpoints": {
        if (!canRun || !api) {
          return;
        }
        const res = await addPoints(command, channel, tags, api);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "removepoints": {
        if (!canRun || !api) {
          return;
        }
        const res = await removePoints(command, channel, tags, api);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "givepoints": {
        const res = await givePoints(command, channel, tags);
        if (res) {
          client.say(res);
        }

        return;
      }
      case "points": {
        const res = await getUserPoints(command, channel, tags.username);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "winrate": {
        const res = await getUserWinrate(command, channel, tags.username);
        if (res) {
          client.say(res);
        }

        return;
      }
      case "gamble": {
        const res = await gamble(command, channel, tags, settings);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "solo": {
        const res = await startSolo(command, channel, tags);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "nope": {
        const res = await soloNope(command, channel, tags);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "yes": {
        const res = await soloYes(command, channel, tags);
        if (res) {
          client.say(res);
        }
        return;
      }
      case "htfu": {
        const res = await spit(command, tags, api);
        if (res) {
          client.say(res);
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

        client.say(res);
        return;
      }
    }
  };
}
