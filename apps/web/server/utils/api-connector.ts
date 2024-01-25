import { TOption } from "bellatrix";

const API_CLIENT_ID = process.env.API_CLIENT_ID;
const API_CLIENT_SECRET = process.env.API_CLIENT_SECRET;
const OAUTH_URL = "https://id.twitch.tv/oauth2/token";

type TTwitchOAuthRefresh = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

type TTwitchValidateToken = {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
};

export async function getChannelRefreshKey(code: string): Promise<TOption<TTwitchOAuthRefresh>> {
  try {
    let url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}`;
    url += `&client_secret=${API_CLIENT_SECRET}`;
    url += `&code=${code}`;
    url += `&grant_type=authorization_code&redirect_uri=${
      process.env.APP_URL || "http://localhost:3000"
    }/api/auth`;

    const res = await fetch(url, { method: "POST" });
    const json = (await res.json()) as TTwitchOAuthRefresh;

    return json;
  } catch {
    return undefined;
  }
}

export async function validateToken(token: string): Promise<TOption<TTwitchValidateToken>> {
  try {
    const url = "https://id.twitch.tv/oauth2/validate";

    const res = await fetch(url, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });

    const json = (await res.json()) as TTwitchValidateToken;

    return json;
  } catch {
    return undefined;
  }
}
