import { API_CLIENT_ID, API_CLIENT_SECRET, OAUTH_URL } from "env";
import ky from "ky";
import type { TResponse } from "types";
import { logger, URL_ENCODED_PARAMS } from "utils";
import { z } from "zod";

const SAccessToken = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
});

type TAccessToken = z.infer<typeof SAccessToken>;

export async function getOAuthToken(): Promise<TResponse<TAccessToken>> {
  const url = `${OAUTH_URL}?client_id=${API_CLIENT_ID}&client_secret=${API_CLIENT_SECRET}&grant_type=client_credentials`;

  try {
    const res = await ky.post(url, URL_ENCODED_PARAMS);

    const data = SAccessToken.parse(await res.json());

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to fetch oauth token");
    console.log(e);
    return { success: false };
  }
}
