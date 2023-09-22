import { TCommand } from "handlers/types";
import { prisma } from "services/db";
import { TOption } from "types";

const PREFIX = "!";

export async function identifyIsBotCommand(
  message: string,
): Promise<TOption<TCommand>> {
  if (message[0] !== "!") {
    return undefined;
  }

  const allCommands = await prisma.commands.findMany();

  const command = allCommands.find((cmd) => {
    const triggerWord = message.includes(" ")
      ? message.substring(1, message.indexOf(" "))
      : message.replace("!", "");

    const byName = triggerWord === cmd.name;

    if (!byName) {
      const byAlias = cmd.alias
        .split(",")
        .map((e) => e.trim())
        .includes(triggerWord);

      return !!byAlias;
    }

    return !!byName;
  });

  if (!command) {
    return undefined;
  }

  return {
    action: command.name,
    actionMessage: command.message,
    original: message,
  };
}
