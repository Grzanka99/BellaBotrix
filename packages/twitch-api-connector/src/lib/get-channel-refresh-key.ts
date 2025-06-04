import { API_CLIENT_ID, API_CLIENT_SECRET, APP_URL, OAUTH_URL } from "env";
import ky from "ky";
import type { TResponse } from "types";
import { logger } from "utils";
import { z } from "zod";

const SOAuthRefresh = z.object({
  access_token: z.coerce.string(),
  expires_in: z.coerce.number(),
  refresh_token: z.coerce.string(),
  scope: z.array(z.coerce.string()),
  token_type: z.string(),
});

type TOAuthRefresh = z.infer<typeof SOAuthRefresh>;

export async function getChannelRefreshKey(code: string): Promise<TResponse<TOAuthRefresh>> {
  let url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}`;
  url += `&client_secret=${API_CLIENT_SECRET}`;
  url += `&code=${code}`;
  url += `&grant_type=authorization_code&redirect_uri=${APP_URL}`;

  try {
    const res = await ky.post(url);
    const data = SOAuthRefresh.parse(await res.json<TOAuthRefresh>());

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to fetch channel refresh key");
    console.log(e);
    return {
      success: false,
    };
  }
}
