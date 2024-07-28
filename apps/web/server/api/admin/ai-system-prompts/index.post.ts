export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  try {
    const highestOrder = await prisma.ollamaAISetupPrompts.findFirst({
      orderBy: { order: "desc" },
      select: { order: true },
    });

    const order = highestOrder?.order ? highestOrder.order + 1 : 1;

    const res = await prisma.ollamaAISetupPrompts.create({
      data: {
        order,
        text: "",
        enabled: false,
      },
    });

    return res;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
