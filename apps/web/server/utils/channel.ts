import { Channel } from "@prisma/client";
import type { H3Event } from "h3";

export async function getChannelFromEvent(event: H3Event): Promise<Channel | undefined> {
  const auth = await requireAuthSession(event);
  const channelId = event.context.params?.channelId as string | undefined;

  if (!channelId || !auth.data.username) {
    return undefined;
  }

  const { username } = auth.data;

  const [channel, user] = await Promise.all([
    prisma.channel.findUnique({ where: { id: Number(channelId) } }),
    prisma.webuiUser.findUnique({ where: { username } }),
  ]);

  if (!channel || !user) {
    return undefined;
  }

  const chacc = await prisma.channelAccess.findFirst({
    where: { channelId: channel.id, userid: user.id },
  });

  if (!chacc) {
    return undefined;
  }

  return channel;
}
