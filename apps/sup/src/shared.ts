import { PrismaClient } from "@prisma/client";
import { SqliteStorage } from "sqlite-storage";

export const SHARED_DB_FILE = Bun.env.SHARED_DB_FILE || "shared.db";

export const storage = new SqliteStorage(SHARED_DB_FILE);
export const prisma = new PrismaClient();
