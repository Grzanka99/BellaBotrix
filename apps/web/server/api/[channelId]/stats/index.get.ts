export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({ statusCode: 401 });
  }

  const streams = await prisma.streams.findFirst({
    where: { channel: `#${channel.name}`, finished_at: undefined },
    orderBy: { started_at: "desc" },
  });

  if (!streams) {
    throw createError({ statusCode: 404 });
  }

  const stats = await prisma.streamStats.findMany({
    where: { streamId: streams.id },
  });

  return stats;
});
