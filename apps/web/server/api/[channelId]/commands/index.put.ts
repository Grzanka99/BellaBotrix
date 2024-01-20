import { Commands } from "@prisma/client";
import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
  enabled: z.coerce.boolean().optional(),
  message: z.coerce.string().optional(),
  aliast: z.coerce.string().optional(),
});

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = BodySchema.safeParse(await readBody(event));

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
    const updated = await prisma.commands.update({
      where: { id },
      data: rest,
    });

    console.log(updated);

    return updated;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
