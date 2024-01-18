export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const commands = await prisma.commands.findMany({
    where: { channelName: `#${channel.name}` },
  });

  return commands.map((el) => ({
    ...el,
    message: typeof el.message === 'string' ? JSON.parse(el.message) : el.message,
  }));
});
