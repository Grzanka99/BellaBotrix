export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ status: 401 });
  }

  const setupPrompts = await prisma.ollamaAISetupPrompts.findMany();

  return setupPrompts;
});
