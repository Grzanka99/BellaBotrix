import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { AsyncQueue } from "utils/async-queue";

const libsql = createClient({
  url: String(Bun.env.TURSO_DATABASE_URL),
  authToken: String(Bun.env.TURSO_AUTH_TOKEN),
});

const adapter = new PrismaLibSQL(libsql);

export const prisma = new PrismaClient({adapter});
export const prismaQueue = new AsyncQueue();

if (prisma) {
  if (Bun.env.RESET_COMMANDS === "true") {
    await prismaQueue.enqueue(() => prisma.commands.deleteMany());
  }
}
