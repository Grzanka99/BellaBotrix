import { SCreateTimer } from "~/types/timers.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SCreateTimer.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const ch = await getChannelFromEvent(event);
  if (!ch) {
    throw createError({
      statusCode: 401,
    });
  }

  const { timeout, message, enabled } = parsed.data;

  try {
    const newTimer = await prisma.timers.create({
      data: {
        channelId: ch.id,
        message,
        timeout,
        enabled,
      },
    });

    return newTimer;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
