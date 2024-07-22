import { PrismaClient } from "@prisma/client";
import type { TAuthSession, TDtoUser, TUser } from "~/types/auth.type";
import type { TPerms } from "~/types/permissions.type";

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

export async function getUserPerms(authData: TAuthSession): Promise<TPerms[]> {
  if (!authData.id) {
    return [];
  }

  const res = await prisma.webuiUser.findUnique({
    where: { id: Number(authData.id) },
    select: { perms: true },
  });

  if (!res) {
    return [];
  }

  return res.perms.split(",") as TPerms[];
}
