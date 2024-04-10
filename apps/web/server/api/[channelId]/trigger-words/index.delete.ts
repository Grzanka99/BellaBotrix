import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = BodySchema.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const channel = await getChannelFromEvent(event);
  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const { id } = parsed.data;

  try {
    const res = await prisma.triggerWords.delete({ where: { id } });
    return res.id;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
