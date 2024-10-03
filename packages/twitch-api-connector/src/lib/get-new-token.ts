import { API_CLIENT_ID, API_CLIENT_SECRET, OAUTH_URL } from "env";
import ky from "ky";
import type { TResponse } from "types";
import { logger, URL_ENCODED_PARAMS } from "utils";
import { z } from "zod";

const SOAuthRefresh = z.object({
  access_token: z.coerce.string(),
  expires_in: z.coerce.number(),
  refresh_token: z.coerce.string(),
  scope: z.array(z.coerce.string()),
  token_type: z.string(),
});

type TOAuthRefresh = z.infer<typeof SOAuthRefresh>;

export async function getNewToken(refreshToken: string): Promise<TResponse<TOAuthRefresh>> {
  const url = `${OAUTH_URL}?grant_type=refresh_token&refresh_token=${refreshToken}&client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}`;

  try {
    const res = await ky.post(url, URL_ENCODED_PARAMS);

    const data = SOAuthRefresh.parse(await res.json());

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to get new token");
    console.log(e);
    return { success: false };
  }
}
