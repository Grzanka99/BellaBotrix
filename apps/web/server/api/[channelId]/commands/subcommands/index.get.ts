export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const name = getQuery(event).name as string | undefined;
  if (name) {
    const command = await prisma.subCommands.findUnique({
      where: { uniqueName: getUniqueName(name, channel.name) },
    });

    return command ? [command] : [];
  }

  const commands = await prisma.subCommands.findMany({
    where: { channelName: `#${channel.name}` },
  });

  // FIXME: Fix entries in DB to always be json
  return commands.map((el) => ({
    ...el,
    message: typeof el.message === "string" ? JSON.parse(el.message) : el.message,
  }));
});
