import type { SubCommands } from "@prisma/client";
import type { TOption } from "types";
import {
  CommandFromDBSchema,
  CommandMessageSchema,
  CommandSchema,
  type TSubCommand,
  type TCommand,
  type TCommandFromDB,
  type TDbInterfaceCommand,
  type TMinimalCommand,
} from "types/schema/commands.schema";

export function dbCommandToCommand(dbCommand: TCommandFromDB): TOption<TCommand> {
  const parsedMessage = CommandMessageSchema.safeParse(
    dbCommand.message
      ? typeof dbCommand.message === "object"
        ? dbCommand.message
        : JSON.parse(dbCommand.message)
      : { base: "" },
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

export function dbSubCommandToSubCommand(dbSubCommand: SubCommands): TSubCommand {
  return {
    name: dbSubCommand.name,
    // @ts-expect-error
    message: dbSubCommand.message,
    alias: dbSubCommand.alias.split(",").map((el) => el.trim()),
    id: dbSubCommand.id,
    uniqueName: dbSubCommand.uniqueName,
    channelName: dbSubCommand.channelName,
  };
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
  command: Omit<TMinimalCommand, "isCore">,
): TOption<TDbInterfaceCommand> {
  return {
    ...command,
    message: JSON.stringify(command.message) as string,
    alias: command.alias?.join(", ") || "",
  };
}
