import { prisma, prismaQueue } from "services/db";
import { BASE_COMMANDS } from "./constants/base-commands";
import { minimalCommandToMinimalDbCommand } from "./commands.transform";

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
        update: {},
        create: {
          uniqueName: getUniqueName(command.name, channel),
          name: command.name,
          message: command.message,
          alias: command.alias,
          enabled: true,
          channelName: channel,
        },
      });
    });
  }
}
