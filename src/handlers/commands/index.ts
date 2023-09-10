import { TCommand, THandlerArgs, TUseHandler } from "handlers/types";
import { getUserPoints } from "./points.command";

export function createCommandHandler(command: TCommand): TUseHandler {
  return async function ({ client, channel, tags }): Promise<void> {
    switch (command.action) {
      case "add": {
        client.say(channel, command.actionMessage || "");
        return;
      }
      case "remove": {
        client.say(channel, command.actionMessage || "");
        return;
      }
      case "points": {
        const res = await getUserPoints(command, tags.username);
        if (res) {
          client.say(channel, res);
        }
        return;
      }
    }
  };
}
