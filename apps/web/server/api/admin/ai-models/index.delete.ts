import { z } from "zod";
import { indicateAIModelsSync } from "~/server/utils/sync";

const BodySchema = z.object({
  id: z.coerce.number(),
});

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  const parsed = BodySchema.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  try {
    const res = await prisma.ollamaAIModels.delete({ where: { id: parsed.data.id } });

    await indicateAIModelsSync();

    return res.id;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
