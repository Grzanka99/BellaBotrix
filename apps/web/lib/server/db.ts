import "server-only"

import { Prisma, PrismaClient } from "@prisma/client"

/**
 * One PrismaClient per server process. In development the module is
 * re-evaluated on every HMR update, so the instance is cached on globalThis
 * to avoid exhausting database connections.
 */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}

/** True for a unique-constraint violation (Prisma P2002), e.g. a concurrent duplicate insert. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  )
}
