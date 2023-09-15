import { bootstrap } from "bot";
import { prisma } from "services/db";
import { getChannelRefreshKey } from "services/twitch-api/api-connector";

bootstrap();

const APP_URL = "http://localhost:3000";

function getAuthFormXd() {
  const base = "https://id.twitch.tv/oauth2/authorize";
  const clientId = Bun.env.API_CLIENT_ID;
  const redirectUri = APP_URL;
  const responseType = "code";
  const scope = "moderator:read:chatters";
  const scope2 = "moderation:read";

  let form = `<form action="${base}" method="get">`;
  form += `<input name="client_id" value="${clientId}" type="hidden" />`;
  form += `<input name="redirect_uri" value="${redirectUri}" type="hidden" />`;
  form += `<input name="response_type" value="${responseType}" type="hidden" />`;
  form += `<input name="scope" value="${scope}" type="hidden" />`;
  form += `<input name="scope" value="${scope2}" type="hidden" />`;
  form += `<input name="channel" type="text" />`;
  form += `<button type="submit">authorize</button>`;
  form += "</form>";

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

      const newChannel = await prisma.channel.create({
        data: {
          name: "asd",
          token: res.refresh_token,
          enabled: true,
        },
      });

      return new Response("Authorized");
    }
    return new Response("Not Found");
  },
});
