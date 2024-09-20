import type { StreamStats } from "@prisma/client";

export default defineEventHandler(async (event): Promise<StreamStats[]> => {
  await requireAuthSession(event);

  const streamId = event.context.params?.streamId as string | undefined;

  if (!streamId) {
    throw createError({ statusCode: 403 });
  }

  const actualUniqueId = streamId.replace("__HASHTAG__", "#");

  try {
    const stats = await prisma.streamStats.findMany({
      where: {
        stream: {
          unique_id: actualUniqueId,
        },
      },
    });

    return stats;
  } catch (e) {
    throw createError({ statusCode: 500 });
  }
});
