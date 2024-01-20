import { SUpdateChatter } from "~/types/chatters.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SUpdateChatter.safeParse(await readBody(event));
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

  const { id, isBot } = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id },
      data: { isBot },
    });

    return updated;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
