export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);
  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const timers = await prisma.timers.findMany({
    where: { channelId: channel.id },
  });

  return timers;
});
