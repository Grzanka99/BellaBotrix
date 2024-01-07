import argon2 from "argon2";
import { createUser } from "~/server/utils/db";
import { SDtoUser } from "~/types/auth.type";

export default defineEventHandler(async (event) => {
  const parsed = SDtoUser.safeParse(await readBody(event));
  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  const { data } = parsed;

  await createUser({
    username: data.username,
    password: await argon2.hash(data.password),
  });

  setResponseStatus(event, 201);
  return {
    message: `User ${data.username} created`,
  };
});
