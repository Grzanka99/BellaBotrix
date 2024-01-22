import { SUpdateTimer } from "~/types/timers.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SUpdateTimer.safeParse(await readBody(event));

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

  const { id, ...rest } = parsed.data;

  try {
    const updated = await prisma.timers.update({
      where: { id },
      data: rest,
    });

    return updated;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
