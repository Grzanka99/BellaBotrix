import { z } from "zod";

const BodySchema = z.object({
  id: z.coerce.number(),
});

async function fixOrder(removedOrder: number): Promise<void> {
  const found = await prisma.ollamaAISetupPrompts.findMany({
    where: {
      order: { gt: removedOrder },
    },
  });

  for (const f of found) {
    await prisma.ollamaAISetupPrompts.update({
      where: { id: f.id },
      data: { ...f, order: f.order - 1 },
    });
  }
}

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
    const res = await prisma.ollamaAISetupPrompts.delete({ where: { id: parsed.data.id } });
    await fixOrder(res.order);
    return res.id;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
