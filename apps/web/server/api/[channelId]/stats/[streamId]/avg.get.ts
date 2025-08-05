import type { StreamStats } from "@prisma/client";

export default defineEventHandler(async (event): Promise<number | undefined> => {
  await requireAuthSession(event);

  const streamId = event.context.params?.streamId as string | undefined;

  if (!streamId) {
    throw createError({ statusCode: 403 });
  }

  const actualUniqueId = streamId.replace("__HASHTAG__", "#");

  try {
    const stats = await prisma.streamStats.aggregate({
      _avg: {
        viewers: true,
      },
      where: {
        stream: {
          unique_id: actualUniqueId,
        },
      },
    });

    return stats._avg.viewers || undefined;
  } catch (e) {
    throw createError({ statusCode: 500 });
  }
});
