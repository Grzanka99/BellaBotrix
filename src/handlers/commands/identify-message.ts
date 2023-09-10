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
    return !!message.startsWith(`${PREFIX}${cmd.name}`);
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
