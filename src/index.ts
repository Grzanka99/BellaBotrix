import { bootstrap } from "bot";
import { prisma } from "services/db";
import {
  getChannelRefreshKey,
  validateToken,
} from "services/twitch-api/api-connector";

bootstrap();

const APP_URL = "http://localhost:3000";

function getAuthFormXd() {
  const base = "https://id.twitch.tv/oauth2/authorize";
  const clientId = Bun.env.API_CLIENT_ID;
  const redirectUri = APP_URL;
  const responseType = "code";
  const scope = "moderator:read:chatters";
  const scope2 = "moderation:read";

  const form = `<form action="${base}" method="get">
                  <input name="client_id" value="${clientId}" type="hidden" />
                  <input name="redirect_uri" value="${redirectUri}" type="hidden" />
                  <input name="response_type" value="${responseType}" type="hidden" />
                  <input name="scope" value="${scope} ${scope2}" type="hidden" />
                  <button type="submit">authorize</button>
                </form>`;

  return form;
}

Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/auth") {
      return new Response(getAuthFormXd(), {
        headers: {
          "Content-Type": "text/html",
        },
      });
    } else if (url.pathname === "/") {
      const code = url.searchParams.get("code");
      const error = url.searchParams.get("error");

      if (!code || error) {
        return new Response("Something went wrong");
      }

      const res = await getChannelRefreshKey(code);

      if (!res) {
        return new Response("Something went wrong");
      }

      const validated = await validateToken(res.access_token);

      if (!validated) {
        return new Response("Something went wrong");
      }

      await prisma.channel.upsert({
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

      return new Response("Authorized");
    }
    return new Response("Not Found");
  },
});
