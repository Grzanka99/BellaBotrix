import { getChannelFromEvent } from "~/server/utils/channel";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const users = await prisma.user.findMany({
    where: { channel: `#${channel.name}` },
  });

  return users;
});
