async function getUsernameById(id: number): Promise<string | undefined> {
  const user = await prisma.webuiUser.findFirst({
    where: { id },
  });

  if (!user) {
    return undefined;
  }

  return user?.username;
}

export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);

  if (!auth.data.channelId) {
    throw createError({
      statusCode: 401,
    });
  }

  const [channel, chacc] = await Promise.all([
    prisma.channel.findUnique({ where: { id: auth.data.channelId } }),
    prisma.channelAccess.findMany({
      where: {
        channelId: auth.data.channelId,
      },
    }),
  ]);

  return await Promise.all(
    chacc.map(async (el) => {
      return {
        ...el,
        username: await getUsernameById(el.userid),
      };
    }),
  );
});
