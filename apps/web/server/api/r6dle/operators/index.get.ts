import type { TR6dleOperatorV2 } from "r6dle";

export default defineEventHandler(async () => {
  const operators = await prisma.r6DleOperators.findMany();

  return operators.map((el) => ({
    ...el,
    role: el.role.split(","),
  })) as TR6dleOperatorV2[];
});
