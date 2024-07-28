import { PrismaClient } from "@prisma/client";
import { SqliteStorage } from "sqlite-storage";
import { AsyncQueue } from "utils/async-queue";

const SHARED_DB_FILE = Bun.env.SHARED_DB_FILE || "shared.db";

export const prisma = new PrismaClient();
export const prismaQueue = new AsyncQueue();

export const storage = new SqliteStorage(SHARED_DB_FILE);

if (prisma) {
  if (Bun.env.RESET_COMMANDS === "true") {
    await prismaQueue.enqueue(() => prisma.commands.deleteMany());
  }
}
