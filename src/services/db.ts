import { logger } from "@cgsh/utils";
import { PrismaClient } from "@prisma/client";
import { AsyncQueue } from "utils/async-queue";

export const prisma = new PrismaClient();
export const prismaQueue = new AsyncQueue();

if (prisma) {
  const count = await prismaQueue.enqueue(() => prisma.commands.count());
  if (!count) {
    await prisma.commands.create({
      data: {
        name: "points",
        enabled: true,
        message: "$username has $points",
      },
    });
  }
}

// NOTE: remove later
setInterval(() => {
  if (prismaQueue.enqueued) {
    logger.info(`PRISMA CURRENTLY ENQUEUED: ${prismaQueue.enqueued}`);
  }
}, 100);
