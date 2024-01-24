export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const settings = await prisma.webuiUser.findFirst({
    where: { channelId: channel.id },
  });

  if (!settings) {
    throw createError({
      statusCode: 404,
    });
  }

  return typeof settings.settings === "string" ? JSON.parse(settings.settings) : settings.settings;
});
