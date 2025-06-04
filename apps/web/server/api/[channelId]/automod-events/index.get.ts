import { getChannelFromEvent } from "~/server/utils/channel";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const events = await prisma.automodEvents.findMany({
    where: { channel: `#${channel.name}` },
  });

  return events;
});
