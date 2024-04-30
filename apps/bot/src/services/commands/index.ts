import { prisma, prismaQueue } from "services/db";
import { minimalCommandToMinimalDbCommand } from "./commands.transform";
import { BASE_COMMANDS } from "./constants/base-commands";

export function getUniqueName(cmd: string, channel: string) {
  const ch = channel.startsWith("#") ? channel : `#${channel}`;
  return `${cmd}@${ch}`;
}

export async function setDefaultCommandsForChannel(channel: string) {
  const mapped = BASE_COMMANDS.map(minimalCommandToMinimalDbCommand);
  for (const command of mapped) {
    const parentCommand = await prismaQueue.enqueue(async () => {
      if (!command) {
        return;
      }

      return await prisma.commands.upsert({
        where: {
          uniqueName: getUniqueName(command.name, channel),
        },
        update: {
          isCore: command.isCore,
        },
        create: {
          uniqueName: getUniqueName(command.name, channel),
          name: command.name,
          // TODO: it is correct type, some ts error I think, but need to fix that
          // @ts-expect-error
          message: command.message,
          alias: command.alias,
          enabled: true,
          channelName: channel,
          isCore: command.isCore,
        },
      });
    });

    if (command?.subCommands && parentCommand) {
      const mappedSubcommand = command.subCommands.map(minimalCommandToMinimalDbCommand);

      for (const subcmd of mappedSubcommand) {
        await prismaQueue.enqueue(async () => {
          if (!subcmd) {
            return;
          }

          return await prisma.subCommands.upsert({
            where: { uniqueName: getUniqueName(parentCommand.name + subcmd.name, channel) },
            update: {
              parentCommand: parentCommand.uniqueName,
            },
            create: {
              uniqueName: getUniqueName(parentCommand.name + subcmd.name, channel),
              name: subcmd.name,
              // TODO: it is correct type, some ts error I think, but need to fix that
              // @ts-expect-error
              message: subcmd.message,
              alias: subcmd.alias,
              channelName: channel,
              parentCommand: parentCommand.uniqueName,
            },
          });
        });
      }
    }
  }
}
