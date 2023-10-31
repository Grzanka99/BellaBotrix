import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelRefreshKey, validateToken } from "services/twitch-api/api-connector";
import { AuthResult } from "webui/components/auth/AuthResult";

export async function authorizeApp(req: Context) {
  const username = String(req.cookie.auth.value.username);
  const code = req.query.code;
  const error = req.query.error;

  if (!code || error) {
    return AuthResult(false);
  }

  const res = await getChannelRefreshKey(code);

  if (!res) {
    return AuthResult(false);
  }

  const validated = await validateToken(res.access_token);

  if (!validated || !validated.user_id) {
    return AuthResult(false);
  }

  const channel = await prisma.channel.upsert({
    where: {
      channel_id: validated.user_id,
    },
    update: {
      token: res.refresh_token,
    },
    create: {
      name: validated.login,
      channel_id: validated.user_id,
      token: res.refresh_token,
      enabled: true,
    },
  });

  await prisma.webuiUser.update({
    where: {
      username: username,
    },
    data: {
      channelId: channel.id,
    },
  });

  return AuthResult(true);
}
