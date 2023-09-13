import { TCommand, TUseHandler } from "handlers/types";
import { addPoints, getUserPoints } from "./points.command";
import { interpolate } from "utils/interpolate-string";
import { gamble } from "./gamble.command";
import { TwitchApi } from "services/twitch-api";
import { TTwitchApiChatter } from "services/types";

export  function createCommandHandler(
  command: TCommand,
  api?: TwitchApi,
): TUseHandler {

  return async function ({ client, channel, tags }): Promise<void> {
  let mods: TTwitchApiChatter[] = [];
  if (api) {
    const res = await api.getChannleModerators();
    mods = res;
  }

  const canRun = (userid: string) => !!mods.find((m) => m.user_id === userid);
    switch (command.action) {
      case "addpoints": {
        if (!canRun) {
          return;
        }
        const res = await addPoints(command, channel, tags);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
      case "removepoints": {
        if (!canRun) {
          return;
        }
        const res = await addPoints(command, channel, tags);
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
