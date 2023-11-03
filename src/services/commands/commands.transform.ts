import { TOption } from "types";
import {
  CommandFromDBSchema,
  CommandMessageSchema,
  CommandSchema,
  TCommand,
  TCommandFromDB,
  TDbInterfaceCommand,
  TMinimalCommand,
} from "types/schema/commands.schema";

export function dbCommandToCommand(dbCommand: TCommandFromDB): TOption<TCommand> {
  const parsedMessage = CommandMessageSchema.safeParse(
    dbCommand.message ? JSON.parse(dbCommand.message) : { base: "" },
  );

  if (!parsedMessage.success) {
    return undefined;
  }

  const res = CommandSchema.safeParse({
    ...dbCommand,
    message: parsedMessage.data,
    alias: dbCommand.alias.split(",").map((e) => e.trim()),
  });

  if (!res.success) {
    return undefined;
  }

  return res.data;
}

export function commandToDbCommand(command: TCommand): TOption<TCommandFromDB> {
  const res = CommandFromDBSchema.safeParse({
    ...command,
    message: JSON.stringify(command.message) as string,
    alias: command.alias?.join(", ") || "",
  });

  if (!res.success) {
    return undefined;
  }

  return res.data;
}

export function minimalCommandToMinimalDbCommand(
  command: TMinimalCommand,
): TOption<TDbInterfaceCommand> {
  return {
    ...command,
    message: JSON.stringify(command.message) as string,
    alias: command.alias?.join(", ") || "",
  };
}
