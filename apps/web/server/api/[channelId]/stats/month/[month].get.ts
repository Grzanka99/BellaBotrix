import type { StreamStats } from "@prisma/client";

export default defineEventHandler(async (event): Promise<number | undefined> => {
  await requireAuthSession(event);
  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({ statusCode: 403 });
  }

  const month = event.context.params?.month as string | undefined;

  if (!month) {
    throw createError({ statusCode: 403 });
  }

  const channelName = `#${channel.name}`;

  try {
    const stats = await prisma.streamStats.aggregate({
      _avg: {
        viewers: true,
      },
      where: {
        stream: {
          channel: channelName,
          unique_id: {
            startsWith: month,
          },
        },
      },
    });

    return stats._avg.viewers || undefined;
  } catch (e) {
    throw createError({ statusCode: 500 });
  }
});
