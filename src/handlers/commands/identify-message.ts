import { TCommand } from "handlers/types";
import { prisma } from "services/db";
import { TOption } from "types";

export async function identifyIsBotCommand(
  message: string,
  channel: string,
  prefix: string,
): Promise<TOption<TCommand>> {
  if (message[0] !== prefix) {
    return undefined;
  }

  const allCommands = await prisma.commands.findMany({ where: { channelName: channel } });

  const command = allCommands.find((cmd) => {
    const triggerWord = message.includes(" ")
      ? message.substring(1, message.indexOf(" "))
      : message.replace(prefix, "");

    const byName = triggerWord === cmd.name;

    if (!byName) {
      const byAlias = cmd.alias.split(",").includes(triggerWord);

      return !!byAlias;
    }

    return !!byName;
  });

  if (!command || !command.enabled) {
    return undefined;
  }

  return {
    action: command.name,
    actionMessage: command.message,
    original: message,
  };
}
