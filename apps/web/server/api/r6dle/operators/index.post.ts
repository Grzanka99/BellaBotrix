import { SCreateR6DleOperator, type TR6dleOperatorV2 } from "r6dle";

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("r6dleadmin")) {
    return createError({
      message: "Unauthorized",
      status: 401,
    });
  }

  const parsed = SCreateR6DleOperator.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const ifExists = await prisma.r6DleOperators.findUnique({ where: { name: parsed.data.name } });
  if (ifExists) {
    throw createError({
      statusCode: 403,
      message: `Operator: '${parsed.data.name}' already exists`,
    });
  }

  const newOperator = await prisma.r6DleOperators.create({
    data: {
      ...parsed.data,
      role: parsed.data.role.join(","),
    },
  });

  if (!newOperator) {
    throw createError({ statusCode: 500 });
  }

  const response = {
    ...newOperator,
    role: newOperator.role.split(","),
  } as TR6dleOperatorV2;

  return response;
});
