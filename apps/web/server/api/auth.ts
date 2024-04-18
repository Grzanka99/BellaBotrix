import { getChannelRefreshKey, validateToken } from "../utils/api-connector";

export default defineEventHandler(async (event) => {
  const errorRedirect = async () => await sendRedirect(event, "/panel?authfailed=true");
  const auth = await requireAuthSession(event);

  const username = auth.data.username;
  const code = getQuery(event).code as string | undefined;
  const error = getQuery(event).error as string | undefined;

  if (!code || error) {
    return await errorRedirect();
  }

  const res = await getChannelRefreshKey(code);

  if (!res) {
    return await errorRedirect();
  }

  const validated = await validateToken(res.access_token);

  if (!validated || !validated.user_id) {
    return await errorRedirect();
  }

  const channel = await prisma.channel.upsert({
    where: { channel_id: validated.user_id },
    update: { token: res.refresh_token },
    create: {
      name: validated.login,
      channel_id: validated.user_id,
      token: res.refresh_token,
      enabled: true,
    },
  });

  await prisma.webuiUser.update({
    where: { username: username },
    data: { channelId: channel.id },
  });

  await prisma.channelAccess.create({
    data: { userid: auth.data.id, channelId: channel.id },
  });

  return await sendRedirect(event, "/panel");
});
