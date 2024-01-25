import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  const parsedBody = BodySchema.safeParse(await readBody(event));

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const res = await prisma.channelAccess.deleteMany({
    where: { userid: parsedBody.data.id, channelId: auth.data.channelId },
  });

  if (res.count === 0) {
    throw createError({
      statusCode: 500,
    });
  }

  return {
    revoke: true,
  };
});
