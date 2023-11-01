import { PrismaClient } from "@prisma/client";
import { AsyncQueue } from "utils/async-queue";
import { BASE_COMMANDS } from "./consants/base-commands";

export const prisma = new PrismaClient();
export const prismaQueue = new AsyncQueue();

if (prisma) {
  if (Bun.env.RESET_COMMANDS === "true") {
    await prismaQueue.enqueue(() => prisma.commands.deleteMany());
  }

  BASE_COMMANDS.forEach(async (command) => {
    await prismaQueue.enqueue(() =>
      prisma.commands.upsert({
        where: {
          name: command.name,
        },
        update: {},
        create: {
          name: command.name,
          message: command.message,
          alias: command.alias,
          enabled: true,
        },
      }),
    );
  });
}
