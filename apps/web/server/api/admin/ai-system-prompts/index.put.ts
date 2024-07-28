import type { OllamaAISetupPrompts } from "@prisma/client";
import { SUpdateAISystemPromptDto, type TUpdateAISystemPromptDto } from "~/types/ai-settings.type";

async function handleWithOrderChange({
  orderDirection,
  ...rest
}: TUpdateAISystemPromptDto): Promise<OllamaAISetupPrompts[]> {
  const all = await prisma.ollamaAISetupPrompts.findMany();

  const thisOne = all.find((el) => el.id === rest.id);
  console.log(thisOne, rest);
  if (!thisOne) {
    throw "Not found element that meant to be updated";
  }

  const oid = orderDirection === "up" ? thisOne.order - 1 : thisOne.order + 1;
  console.log(oid);

  const toBeReplaced = all.find((el) => el.order === oid);
  console.log(toBeReplaced);

  if (toBeReplaced === undefined) {
    const res = await prisma.ollamaAISetupPrompts.update({
      where: { id: rest.id },
      data: { order: oid },
    });

    return [res];
  }

  const res = await Promise.all([
    prisma.ollamaAISetupPrompts.update({
      where: { id: toBeReplaced.id },
      data: { order: thisOne.order },
    }),
    prisma.ollamaAISetupPrompts.update({
      where: { id: thisOne.id },
      data: { order: toBeReplaced.order },
    }),
  ]);

  return res;
}

export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  const parsed = SUpdateAISystemPromptDto.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({ statusCode: 400 });
  }

  try {
    if (parsed.data.orderDirection) {
      return handleWithOrderChange(parsed.data);
    }

    const updated = await prisma.ollamaAISetupPrompts.update({
      where: { id: parsed.data.id },
      data: {
        name: parsed.data.name,
        text: parsed.data.text,
        enabled: parsed.data.enabled,
      },
    });

    return [updated];
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
