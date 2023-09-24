import { TCommand, TUseHandler } from "handlers/types";
import { addPoints, getUserPoints, removePoints } from "./points.command";
import { interpolate } from "utils/interpolate-string";
import { gamble } from "./gamble.command";
import { TwitchApi } from "services/twitch-api";
import { soloNope, soloYes, startSolo } from "./solo.command";
import { TOption } from "types";
import { getCanRun } from "./utils/can-run";
import { spit } from "./spit.command";

export function createCommandHandler(
  command: TCommand,
  api?: TwitchApi,
): TOption<TUseHandler> {
  if (!api) {
    return undefined;
  }
  return async function ({ client, channel, tags }): Promise<void> {
    const mods = await api.getChannleModerators();
    const canRun = getCanRun(mods, channel, tags);

    const addpointsHandler = () => {};

    switch (command.action) {
      case "addpoints": {
        if (!canRun || !api) {
          return;
        }
        const res = await addPoints(command, channel, tags, api);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "removepoints": {
        if (!canRun || !api) {
          return;
        }
        const res = await removePoints(command, channel, tags, api);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "points": {
        const res = await getUserPoints(command, channel, tags.username);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "gamble": {
        const res = await gamble(command, channel, tags);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "solo": {
        const res = await startSolo(command, channel, tags);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "nope": {
        const res = await soloNope(command, channel, tags);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "yes": {
        const res = await soloYes(command, channel, tags);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "htfu": {
        const res = await spit(command, tags, api);
        if(res) {
          client.say(channel, res);
        }
        return;
      }
      default: {
        if (!command.actionMessage) {
          return;
        }

        const res = interpolate(command.actionMessage, {
          username: tags.username || "",
          channel,
        });

        client.say(channel, res);
        return;
      }
    }
  };
}
