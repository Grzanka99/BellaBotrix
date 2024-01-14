export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  const user = await prisma.webuiUser.findUnique({ where: { username: auth.data.username } });

  if (!user) {
    throw createError({
      statusCode: 400,
    });
  }

  const chacc = await prisma.channelAccess.findMany({ where: { userid: user.id } });
  const chaccList = await prisma.channel.findMany({
    where: {
      id: {
        in: chacc.map((el) => el.channelId),
      },
    },
    select: {
      name: true,
      id: true,
    },
  });

  return chaccList;
});
