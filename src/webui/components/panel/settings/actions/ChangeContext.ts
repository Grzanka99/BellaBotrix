import { Context } from "elysia";
import { prisma } from "services/db";
import { R_SETTINGS } from "webui/routes";
import { z } from "zod";

const BodySchema = z.object({
  channelId: z.coerce.number(),
});

const NewCookie = z.object({
  username: z.string(),
  key: z.string(),
  channelId: z.coerce.string(),
});

export async function ChangeContext(ctx: Context) {
  const authCookie = ctx.cookie.auth.value as {
    username?: string;
    key?: string;
  };

  if (!authCookie || !authCookie.username || !authCookie.key) {
    ctx.set.status = "Unauthorized";
    ctx.set.redirect = R_SETTINGS.PREFIX;
    return;
  }

  const parsed = BodySchema.safeParse(ctx.body);

  if (!parsed.success) {
    ctx.set.status = "Bad Request";
    ctx.set.redirect = R_SETTINGS.PREFIX;
    return;
  }

  const user = await prisma.webuiUser.findFirst({ where: { username: authCookie.username } });
  if (!user) {
    ctx.set.status = "Bad Request";
    ctx.set.redirect = R_SETTINGS.PREFIX;
    return;
  }

  const hasAccess = await prisma.channelAccess.findFirst({
    where: {
      userid: user.id,
      channelId: parsed.data.channelId,
    },
  });

  if (!hasAccess) {
    ctx.set.status = "Unauthorized";
    ctx.set.redirect = R_SETTINGS.PREFIX;
    return;
  }

  const newCookieData = NewCookie.safeParse({
    ...authCookie,
    channelId: hasAccess.channelId,
  });

  if (!newCookieData.success) {
    ctx.set.status = "Bad Request";
    ctx.set.redirect = R_SETTINGS.PREFIX;
    return;
  }

  ctx.cookie.auth.value = newCookieData.data;
  ctx.cookie.auth.path = "/"
  ctx.set.redirect = R_SETTINGS.PREFIX;
  return;
}
