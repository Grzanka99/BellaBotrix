export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);
  console.log(auth);
  return {
    message: `You are accessing secret api with email: ${auth.data.username}`,
  };
});
