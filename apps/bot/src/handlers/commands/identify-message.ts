import { TWithCommandHandler } from "handlers/types";
import { dbCommandToCommand } from "services/commands/commands.transform";
import { prisma } from "services/db";
import { TOption } from "types";

export async function identifyIsBotCommand(
  message: string,
  channel: string,
  prefix: string,
): Promise<TOption<TWithCommandHandler>> {
  if (message[0] !== prefix) {
    return undefined;
  }

  const triggerWord = message.includes(" ")
    ? message.substring(1, message.indexOf(" "))
    : message.replace(prefix, "");

  const allCommands = await prisma.commands.findMany({ where: { channelName: channel } });

  const command = allCommands.find((cmd) => {
    const byName = triggerWord.trim() === cmd.name.trim();

    if (!byName) {
      const byAlias = cmd.alias
        .split(",")
        .map((el) => el.trim())
        .includes(triggerWord);

      return !!byAlias;
    }

    return !!byName;
  });

  if (!command || !command.enabled) {
    return undefined;
  }

  const parsedCommand = dbCommandToCommand(command);

  if (!parsedCommand) {
    return undefined;
  }

  return {
    action: command.name,
    actionMessage: parsedCommand.message,
    original: message,
  };
}
