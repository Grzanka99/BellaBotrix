import { TCommand, TUseHandler } from "handlers/types";
import { addPoints, getUserPoints, removePoints } from "./points.command";
import { interpolate } from "utils/interpolate-string";
import { gamble } from "./gamble.command";
import { TwitchApi } from "services/twitch-api";
import { TTwitchApiChatter } from "services/types";
import { soloNope, soloYes, startSolo } from "./solo.command";
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

export function createCommandHandler(
  command: TCommand,
  api?: TwitchApi,
): TUseHandler {
  return async function ({ client, channel, tags }): Promise<void> {
    let mods: TTwitchApiChatter[] = [];
    if (api) {
      const res = await api.getChannleModerators();
      mods = res;
    }

    const canRun = getCanRun(mods, channel, tags);
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
