import argon2 from "argon2";
import { createUser } from "~/server/utils/db";
import { SDtoCreateUser } from "~/types/auth.type";

export default defineEventHandler(async (event) => {
  const parsed = SDtoCreateUser.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  const { data } = parsed;

  if (process.env.REG_TOKEN !== data.regToken) {
    throw createError({ statusCode: 401 });
  }

  await createUser({
    username: data.username,
    password: await argon2.hash(data.password),
  });

  setResponseStatus(event, 201);
  return {
    message: `User ${data.username} created`,
  };
});
