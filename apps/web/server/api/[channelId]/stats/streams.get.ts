export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({ statusCode: 401 });
  }

  const streams = await prisma.streams.findMany({
    where: { channel: `#${channel.name}` },
    orderBy: { started_at: "desc" },
  });

  if (!streams) {
    throw createError({ statusCode: 404 });
  }

  return streams;
});
