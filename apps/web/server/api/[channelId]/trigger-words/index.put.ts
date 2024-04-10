import { SUpdateTriggerWord } from "~/types/trigger-words.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SUpdateTriggerWord.safeParse(await readBody(event));

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
    const updated = await prisma.triggerWords.update({
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
