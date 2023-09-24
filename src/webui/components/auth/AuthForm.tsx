const base = "https://id.twitch.tv/oauth2/authorize";
const clientId = Bun.env.API_CLIENT_ID;
const redirectUri = Bun.env.APP_URL || 'http://localhost:3000';
const responseType = "code";
const scopes = ["moderator:read:chatters", "moderation:read"];

export const AuthForm = () => (
  <form action={base} method="get">
    <input name="client_id" value={clientId} type="hidden" />
    <input name="redirect_uri" value={redirectUri} type="hidden" />
    <input name="response_type" value={responseType} type="hidden" />
    <input name="scope" value={scopes.join(" ")} type="hidden" />
    <button type="submit">AUTHORIZE</button>
  </form>
);
