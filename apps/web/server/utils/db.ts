import { PrismaClient } from "@prisma/client";
import type { TDtoUser, TUser } from "~/types/auth.type";

export const prisma = new PrismaClient();

export async function findUserByUsername(username: string): Promise<TUser | undefined> {
  const res = await prisma.webuiUser.findUnique({ where: { username } });
  if (!res) {
    return undefined;
  }

  return res;
}

export async function createUser(user: TDtoUser) {
  const isUsernameTaken = await findUserByUsername(user.username);

  if (isUsernameTaken) {
    throw createError({ message: "Username already exists!", statusCode: 409 });
  }

  const newUser = await prisma.webuiUser.create({
    data: {
      username: user.username,
      password: user.password,
      settings: {},
    },
  });

  return newUser;
}
