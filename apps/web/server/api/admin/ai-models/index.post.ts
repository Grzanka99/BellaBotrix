import { indicateAIModelsSync } from "~/server/utils/sync";
import { SCreateAIModelDto } from "~/types/ai-settings.type";

export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  const parsed = SCreateAIModelDto.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  try {
    const res = await prisma.ollamaAIModels.create({
      data: {
        name: parsed.data.name,
        description: parsed.data.description,
        enabled: true,
      },
    });

    await indicateAIModelsSync();

    return res;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
