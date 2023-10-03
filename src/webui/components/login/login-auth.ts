import { Context } from "elysia";
import { prisma } from "services/db";

type TBody = {
  username?: string;
  password?: string;
};

export async function loginAuth(req: Context) {
  const body = req.body as TBody;

  if (!body.username || !body.password) {
    console.log("missing data");
    return false;
  }

  const res = await prisma.webuiUser.findUnique({
    where: {
      username: body.username,
    },
  });

  if (!res) {
    console.log("db error");
    return false;
  }

  const isMatch = await Bun.password.verify(body.password, res.password);

  if (!isMatch) {
    console.log("password mismatch");
    return false;
  }

  const authCookie = req.cookie.auth;
  const key = `${body.username}@${Date.now()}`;

  authCookie.value = {
    username: body.username,
    key,
  };
  authCookie.path = "/"

  await prisma.webuiUser.update({
    where: {
      id: res.id,
    },
    data: {
      token: key,
    },
  });

  req.set.redirect = "/panel";
}
