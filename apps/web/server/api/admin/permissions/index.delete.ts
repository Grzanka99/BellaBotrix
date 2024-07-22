import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("admin")) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  throw createError({
    message: "Disabled",
    statusCode: 401,
  });

  const parsed = BodySchema.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  try {
    const res = await prisma.webuiUser.delete({ where: { id: parsed.data.id } });
    return res.id;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
