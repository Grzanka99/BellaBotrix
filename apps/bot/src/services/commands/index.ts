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
    await prismaQueue.enqueue(async () => {
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
  }
}
