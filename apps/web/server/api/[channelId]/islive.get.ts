import { isLive } from "~/server/utils/sync";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({ statusCode: 401 });
  }

  const res = await isLive(channel.name);

  return res;
});
