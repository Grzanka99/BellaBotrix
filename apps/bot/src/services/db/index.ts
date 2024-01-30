import { PrismaClient } from "database";
import { AsyncQueue } from "utils/async-queue";

export const prisma = new PrismaClient();
export const prismaQueue = new AsyncQueue();

if (prisma) {
  if (Bun.env.RESET_COMMANDS === "true") {
    await prismaQueue.enqueue(() => prisma.commands.deleteMany());
  }
}
