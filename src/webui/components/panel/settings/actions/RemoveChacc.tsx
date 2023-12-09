import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";
import { z } from "zod";

const BodySchema = z.object({
  username: z.string(),
});

export const RevokeChacc = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    ctx.set.status = "Bad Request";
    console.log("no channel");
    return;
  }

  const parsedBody = BodySchema.safeParse(ctx.body);

  if (!parsedBody.success) {
    console.log("wrong data");
    console.log(parsedBody.error.errors);
    ctx.set.status = "Bad Request";
    return;
  }

  const { username } = parsedBody.data;

  const user = await prisma.webuiUser.findFirst({ where: { username } });

  if (!user) {
    ctx.set.status = "Not Found";
    return;
  }

  const res = await prisma.channelAccess.deleteMany({
    where: {
      userid: user.id,
      channelId: channel.id,
    },
  });

  if (res.count === 0) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return;
};
