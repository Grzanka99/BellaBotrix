import { Context } from "elysia";
import { prisma } from "services/db";
import { EChannelAccessLevel } from "types";
import { getChannelFromCtx } from "webui/helpers";
import { z } from "zod";
import { ChaccSingleItem } from "../ChaccSingleItem";

const BodySchema = z.object({
  username: z.string(),
  accessLevel: z.nativeEnum(EChannelAccessLevel),
});

export const AddChacc = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    ctx.set.status = "Bad Request";
    console.log("no channel");
    return;
  }

  const parsedBody = BodySchema.safeParse(ctx.body);

  if (!parsedBody.success) {
    console.log("wrong data");
    console.log(parsedBody.error.errors)
    ctx.set.status = "Bad Request";
    return;
  }

  const { username, accessLevel } = parsedBody.data;

  const user = await prisma.webuiUser.findFirst({
    where: {
      username,
    },
  });

  if (!user) {
    console.log("no user");
    ctx.set.status = "Bad Request";
    return;
  }

  const newEntry = await prisma.channelAccess.create({
    data: {
      userid: user.id,
      channelId: channel.id,
      accessLevel,
    },
  });

  if (!newEntry) {
    console.log("no new newEntry");
    ctx.set.status = "Internal Server Error";
    return;
  }

  return <ChaccSingleItem username={username} accessLevel={accessLevel} />;
};
