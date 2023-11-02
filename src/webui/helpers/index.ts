import { Channel } from "@prisma/client";
import { Context } from "elysia";
import { prisma } from "services/db";
import { TOption } from "types";

export async function getChannelFromCtx(ctx: Context): Promise<TOption<Channel>> {
  const username = String(ctx.cookie.auth.value.username);

  if (!username) {
    return undefined;
  }

  const channel = await prisma.channel.findUnique({
    where: { id: (await prisma.webuiUser.findUnique({ where: { username } }))?.channelId },
  });

  if (!channel) {
    return undefined;
  }

  return channel;
}
