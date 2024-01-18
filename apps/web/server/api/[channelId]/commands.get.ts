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

  console.log(typeof commands[0].message);

  return commands.map((el) => ({
    ...el,
    message: el.message ? JSON.parse(String(el.message)) : null,
  }));
});
