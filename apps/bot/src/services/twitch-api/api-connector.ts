import {
  TTwitchApiChatter,
  TTwitchApiResponse,
  TTwitchApiStream,
  TTwitchApiUser,
  TTwitchFollowers,
  TTwitchOAuthRefresh,
  TTwitchValidateToken,
} from "services/types";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";

const API_CLIENT_ID = Bun.env.API_CLIENT_ID;
const API_CLIENT_SECRET = Bun.env.API_CLIENT_SECRET;
const OAUTH_URL = "https://id.twitch.tv/oauth2/token";

const ID_URL = "https://api.twitch.tv/helix/users?login=$username";

const post = (url: string): Promise<Response> =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

export async function getChannelRefreshKey(code: string): Promise<TOption<TTwitchOAuthRefresh>> {
  try {
    let url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}`;
    url += `&client_secret=${API_CLIENT_SECRET}`;
    url += `&code=${code}`;
    url += `&grant_type=authorization_code&redirect_uri=${
      Bun.env.APP_URL || "http://localhost:3000"
    }`;

    const res = await fetch(url, { method: "POST" });
    const json = await res.json<TTwitchOAuthRefresh>();

    return json;
  } catch {
    return undefined;
  }
}

export async function getChannelFollowers(
  userid: string,
  token: string,
  startAt: string | undefined = undefined,
): Promise<TOption<TTwitchApiResponse<TTwitchFollowers[]> & { total: number }>> {
  const url = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userid}&moderator_id=${userid}&first=100&after=${
    startAt || ""
  }`;

  console.log(url);

  const res = await fetch(url, {
    cache: "no-cache",
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": API_CLIENT_ID,
    } as unknown,
  });

  const asjson = (await res.json()) as TTwitchApiResponse<TTwitchFollowers[]> & { total: number };
  return asjson;
}

export async function validateToken(token: string): Promise<TOption<TTwitchValidateToken>> {
  try {
    const url = "https://id.twitch.tv/oauth2/validate";

    const res = await fetch(url, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });

    const json = await res.json<TTwitchValidateToken>();

    return json;
  } catch {
    return undefined;
  }
}

export async function getNewToken(refreshToken: string): Promise<TOption<TTwitchOAuthRefresh>> {
  try {
    const res = await post(
      `${OAUTH_URL}?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}`,
    );

    if (res.status === 400) {
      return undefined;
    }

    const json = await res.json<TTwitchOAuthRefresh>();

    return json;
  } catch {
    return undefined;
  }
}

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

export async function getChatters(
  userid: string,
  token: string,
): Promise<TOption<TTwitchApiResponse<TTwitchApiChatter[]>>> {
  const url = `https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${userid}&moderator_id=${userid}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": API_CLIENT_ID,
    } as HeadersInit,
  });

  if (res.status !== 200) {
    return undefined;
  }

  const json = await res.json<TTwitchApiResponse<TTwitchApiChatter[]>>();

  return json;
}

export async function getModerators(
  userid: string,
  token: string,
): Promise<TOption<TTwitchApiResponse<TTwitchApiChatter[]>>> {
  const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${userid}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": API_CLIENT_ID,
    } as HeadersInit,
  });

  if (res.status !== 200) {
    return undefined;
  }

  const json = await res.json<TTwitchApiResponse<TTwitchApiChatter[]>>();
  return json;
}

export async function getStreams(
  userid: string,
  token: string,
): Promise<TOption<TTwitchApiResponse<TTwitchApiStream[]>>> {
  const url = `https://api.twitch.tv/helix/streams?user_id=${userid}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Client-Id": API_CLIENT_ID,
    } as HeadersInit,
  });

  if (res.status !== 200) {
    return undefined;
  }

  const json = await res.json<TTwitchApiResponse<TTwitchApiStream[]>>();
  return json;
}
