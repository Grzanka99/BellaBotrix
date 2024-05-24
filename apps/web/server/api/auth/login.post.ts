import argon2 from "argon2";
import { useAuthSession } from "~/server/utils/session";
import { SDtoUser } from "~/types/auth.type";

export default defineEventHandler(async (event) => {
  const session = await useAuthSession(event);
  const parsed = SDtoUser.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const { data } = parsed;

  const user = await findUserByUsername(data.username);

  if (!user) {
    throw createError({
      message: "Wrong username or password",
      statusCode: 401,
    });
  }

  if (!(await argon2.verify(user.password, data.password))) {
    throw createError({
      message: "Wrong username or password",
      statusCode: 401,
    });
  }

  await session.update({
    id: user.id,
    username: user.username,
    channelId: user.channelId,
    perms: user.perms.split(","),
  });

  return session;
});
