import { prisma } from "services/db";
import { dbCommandToCommand } from "../commands.transform";
import { interpolate } from "utils/interpolate-string";
import { CoreCommand } from "./core-commands/core-command";
import type { THandleCommadArgs } from "services/types";
import { CoreCommandsHandlers } from "./core-commands";

export class CommandHandler {
  private channel: string;

  constructor(channel: string) {
    this.channel = channel;
  }

  public async handle(args: THandleCommadArgs): Promise<undefined> {
    if (!args.api || !args.settings.commands.enabled.value || !args.message) {
      return undefined;
    }

    const prefix = args.settings.commands.prefix.value;

    if (args.message[0] !== prefix) {
      return undefined;
    }

    const triggerWord = args.message.includes(" ")
      ? args.message.substring(1, args.message.indexOf(" "))
      : args.message.replace(prefix, "");

    const allCommands = await prisma.commands.findMany({
      where: { channelName: this.channel, enabled: true },
    });

    const command = allCommands.find((cmd) => {
      const byName = triggerWord.trim().toLowerCase() === cmd.name.trim().toLowerCase();

      if (!byName) {
        const byAlias = cmd.alias
          .split(",")
          .map((el) => el.trim())
          .includes(triggerWord.trim().toLowerCase());

        return !!byAlias;
      }

      return !!byName;
    });

    if (!command) {
      return undefined;
    }

    // NOTE: JsonValue is specifix to prisma (I guess) but it can be consider string in that case
    // @ts-expect-error
    const parsedCommand = dbCommandToCommand(command);

    if (!parsedCommand) {
      return undefined;
    }

    if (parsedCommand.isCore && CoreCommandsHandlers[parsedCommand.name]) {
      const res = await CoreCommandsHandlers[parsedCommand.name].handle({ ...args, parsedCommand });
      if (res) {
        args.send(res);
      }
      return undefined;
    }

    if (!parsedCommand.message || !parsedCommand.message.base) {
      return undefined;
    }

    const res = interpolate(parsedCommand.message.base, {
      username: args.tags?.username || "",
      this: this.channel,
    });

    args.send(res);

    return undefined;
  }
}
