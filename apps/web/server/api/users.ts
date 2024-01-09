export default defineEventHandler(async (event) => {
  const res = await prisma.user.findMany();

  return res;
})
