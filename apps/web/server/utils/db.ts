import { PrismaClient } from "@prisma/client";
import { SDtoUser, TDtoUser, TUser } from "~/types/auth.type";

export const prisma = new PrismaClient();

export async function findUserByUsername(username: string): Promise<TUser | undefined> {
  const res = await prisma.webuiUser.findUnique({ where: { username } });
  if (!res) {
    return undefined;
  }

  return res;
}

export async function createUser(user: TDtoUser) {
  const parsed = SDtoUser.safeParse(user);

  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  const { data } = parsed;

  const isUsernameTaken = await findUserByUsername(data.username);

  if (isUsernameTaken) {
    throw createError({ message: "Username already exists!", statusCode: 409 });
  }

  const newUser = await prisma.webuiUser.create({
    data: {
      username: data.username,
      password: data.password,
      settings: {},
    },
  });

  return newUser;
}
