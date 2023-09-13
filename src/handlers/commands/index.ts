import { TCommand, TUseHandler } from "handlers/types";
import { addPoints, getUserPoints } from "./points.command";
import { interpolate } from "utils/interpolate-string";

export function createCommandHandler(command: TCommand): TUseHandler {
  return async function ({ client, channel, tags }): Promise<void> {
    switch (command.action) {
      case "addpoints": {
        const res = await addPoints(command, channel, tags);
        if(res) {
          client.say(channel, res);
        }
        return;
      }
      case "removepoints": {
        const res = await addPoints(command, channel, tags);
        if(res) {
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
