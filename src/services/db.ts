import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

if (prisma) {
  const count = await prisma.commands.count();
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
