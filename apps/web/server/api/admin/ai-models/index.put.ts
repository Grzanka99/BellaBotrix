import { indicateAIModelsSync } from "~/server/utils/sync";
import { SUpdateAIModelDto } from "~/types/ai-settings.type";

export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  const parsed = SUpdateAIModelDto.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  const { id, ...data } = parsed.data;

  try {
    const updated = await prisma.ollamaAIModels.update({
      where: { id },
      data,
    });

    await indicateAIModelsSync();

    return updated;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
