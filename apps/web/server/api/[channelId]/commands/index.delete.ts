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
    await prisma.commands.delete({ where: { id } });
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
