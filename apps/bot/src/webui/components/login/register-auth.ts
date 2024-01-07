import { Context } from "elysia";
import { prisma } from "services/db";

type TBody = {
  username?: string;
  password?: string;
  regtoken?: string;
};
// superextremeregtoken

const UNAUTHORIZED = "Unauthorized";

export async function registerAuth(ctx: Context) {
  const body = ctx.body as TBody;

  if (!body || !body.username || !body.password || !body.regtoken) {
    return UNAUTHORIZED;
  }

  if (body.regtoken !== Bun.env.REG_TOKEN) {
    return UNAUTHORIZED;
  }

  const ifExists = await prisma.webuiUser.findUnique({ where: { username: body.username } });
  if (ifExists) {
    return "Internal Server Error";
  }

  await prisma.webuiUser.create({
    data: {
      username: body.username,
      password: await Bun.password.hash(body.password),
    },
  });

  return "Now go to /login";
}
