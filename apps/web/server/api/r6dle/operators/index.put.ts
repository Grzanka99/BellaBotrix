import { SUpdateR6DleOperator, type TR6dleOperatorV2 } from "r6dle";

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("r6dleadmin")) {
    return createError({
      message: "Unauthorized",
      status: 401,
    });
  }

  const parsed = SUpdateR6DleOperator.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      status: 400,
    });
  }

  const { id, ...rest } = parsed.data;

  try {
    const updated = await prisma.r6DleOperators.update({
      where: { id },
      data: {
        ...rest,
        role: rest.role ? rest.role.join(",") : undefined,
      },
    });

    return {
      ...updated,
      role: updated.role.split(","),
    } as TR6dleOperatorV2;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
