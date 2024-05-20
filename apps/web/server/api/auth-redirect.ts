export default defineEventHandler(async (event) => {
  const base = "https://id.twitch.tv/oauth2/authorize";
  const clientId = process.env.API_CLIENT_ID;
  const redirectUri = process.env.APP_URL || "http://localhost:3000";
  const responseType = "code";
  const scopes = [
    "moderator:read:chatters",
    "moderation:read",
    "channel:moderate",
    "moderator:read:followers",
  ];

  await sendRedirect(
    event,
    `${base}?client_id=${clientId}&redirect_uri=${redirectUri}/api/auth&response_type=${responseType}&scope=${scopes.join(
      " ",
    )}`,
  );
});
