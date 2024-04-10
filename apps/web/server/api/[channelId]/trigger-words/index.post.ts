import { SCreateTriggerWord } from "~/types/trigger-words.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SCreateTriggerWord.safeParse(await readBody(event));

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

  const { triggers, response } = parsed.data;

  try {
    const newTrigger = await prisma.triggerWords.create({
      data: {
        channelId: ch.id,
        triggers,
        response,
        enabled: true,
      },
    });

    return newTrigger;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
