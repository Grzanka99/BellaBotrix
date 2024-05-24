import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("r6dleadmin")) {
    return createError({
      message: "Unauthorized",
      status: 401,
    });
  }

  const parsed = BodySchema.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      status: 400,
    });
  }

  const { id } = parsed.data;

  try {
    const res = await prisma.r6DleOperators.delete({ where: { id } });
    return res.id;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
