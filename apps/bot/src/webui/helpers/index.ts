import { Channel } from "@prisma/client";
import { Context } from "elysia";
import { prisma } from "services/db";
import { TOption } from "types";

export async function getChannelFromCtx(ctx: Context): Promise<TOption<Channel>> {
  const username = String(ctx.cookie.auth.value.username);
  const channelId = String(ctx.cookie.auth.value.channelId);

  if (!username && !channelId) {
    return undefined;
  }

  if (channelId.length && Number(channelId)) {
    const channel = await prisma.channel.findUnique({ where: { id: Number(channelId) } });

    if (channel) {
      return channel;
    }
  }

  const channel = await prisma.channel.findUnique({
    where: { id: (await prisma.webuiUser.findUnique({ where: { username } }))?.channelId },
  });

  if (!channel) {
    return undefined;
  }

  return channel;
}

export const dbfc = (v: "on" | "off" | undefined) => v === "on";
