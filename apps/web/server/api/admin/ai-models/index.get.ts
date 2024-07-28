export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin", "ai+"])) {
    throw createError({ statusCode: 401 });
  }

  const models = await prisma.ollamaAIModels.findMany();

  return models;
});
