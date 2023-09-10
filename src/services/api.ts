import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";
import { TTwitchApiChatter, TTwitchApiResponse, TTwitchApiUser } from "./types";

const API_CLIENT_ID = Bun.env.API_CLIENT_ID;
const API_CLIENT_SECRET = Bun.env.API_CLIENT_SECRET;
const API_AUTHORIZED_CODE = Bun.env.API_AUTHORIZED_CODE;
const API_MODERATOR_OAUTH = Bun.env.API_MODERATOR_OAUTH;

const OAUTH_URL = "https://id.twitch.tv/oauth2/token";
const ID_URL = "https://api.twitch.tv/helix/users?login=$username";

export async function getOAuthToken(): Promise<TOption<string>> {
  const url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}&grant_type=client_credentials`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    const { access_token } = await res.json();
    return access_token;
  } catch {
    return undefined;
  }
}

export async function getTwitchApiUser(
  username: string,
  accessToken: string,
): Promise<TOption<TTwitchApiResponse<TTwitchApiUser[]>>> {
  try {
    const url = interpolate(ID_URL, { username });
    const res = await fetch(url, {
      cache: "no-cache",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Client-Id": API_CLIENT_ID,
      } as HeadersInit,
    });

    return await res.json<TTwitchApiResponse<TTwitchApiUser[]>>();
  } catch {
    return undefined;
  }
}

// async function getModeratorAuthKey() {
//   try {
//     console.log(API_AUTHORIZED_CODE);
//     const url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}&code=${API_AUTHORIZED_CODE}&grant_type=authorization_code&redirect_uri=http://localhost:3000`;
//     const res = await fetch(url, { method: "POST" });
//     console.log(await res.json());
//   } catch (e) {
//     console.log(e);
//     return undefined;
//   }
// }

export async function getChatters(
  broadcaster: string,
  token: string,
): Promise<TOption<TTwitchApiResponse<TTwitchApiChatter[]>>> {
  try {
    const broadcasterUser = await getTwitchApiUser(broadcaster, token);

    if (!broadcasterUser || !broadcasterUser.data.length) {
      return undefined;
    }

    const { id } = broadcasterUser.data[0];
    const url = `https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${id}&moderator_id=${id}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${API_MODERATOR_OAUTH}`,
        "Client-Id": API_CLIENT_ID,
      } as HeadersInit,
    });

    return await res.json();
  } catch {
    return undefined;
  }
}
