export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);
  if (!channel) {
    throw createError({
      status: 401,
    });
  }

  const triggers = await prisma.triggerWords.findMany({
    where: { channelId: channel.id },
  });

  return triggers;
});
