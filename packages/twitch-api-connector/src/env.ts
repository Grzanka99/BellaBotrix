export const API_CLIENT_ID = Bun.env.API_CLIENT_ID as string;
export const API_CLIENT_SECRET = Bun.env.API_CLIENT_SECRET as string;
export const OAUTH_URL = "https://id.twitch.tv/oauth2/token" as const;
export const ID_URL = "https://api.twitch.tv/helix/users?login=$username" as string;
export const APP_URL = Bun.env.APP_URL || "http://localhost:3000";
