export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);
  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const solos = await prisma.solo.findMany({
    where: { channel: `#${channel.name}` },
  });

  return solos;
});
