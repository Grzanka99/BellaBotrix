export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const streamId = event.context.params?.streamId as string | undefined;

  if (!streamId) {
    throw createError({ statusCode: 403 });
  }

  const actualUniqueId = streamId.replace("__HASHTAG__", "#");

  const stats = prisma.streamStats.findMany({
    where: {
      stream: {
        unique_id: actualUniqueId,
      },
    },
  });

  return stats;
});
