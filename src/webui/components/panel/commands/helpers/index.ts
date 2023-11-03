import { dbCommandToCommand } from "services/commands/commands.transform";
import { prisma } from "services/db";
import { TOption } from "types";
import { CommandFromDBSchema, CommandSchema, TCommand } from "types/schema/commands.schema";

export async function getCommandFromDbByUniqueName(uniqueName: string): Promise<TOption<TCommand>> {
  const parsedDbCommand = CommandFromDBSchema.safeParse(
    await prisma.commands.findUnique({ where: { uniqueName } }),
  );

  if (!parsedDbCommand.success) {
    return undefined;
  }

  const parsedToCommand = CommandSchema.safeParse(dbCommandToCommand(parsedDbCommand.data));

  if (!parsedToCommand.success) {
    return undefined;
  }

  return parsedToCommand.data;
}
