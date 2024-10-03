import { ID_URL } from "env";
import ky from "ky";
import { SWrappedResponse, type TResponse, type TWrappedResponse } from "types";
import { bearerTokenParams, interpolate, logger } from "utils";
import { z } from "zod";

const STwitchUser = z.object({
  id: z.string(),
  login: z.string(),
  display_name: z.string(),
  type: z.string(),
  broadcaster_type: z.string(),
  description: z.string(),
  profile_image_url: z.string(),
  offline_image_url: z.string(),
  view_count: z.number(),
  created_at: z.string(),
});

type TTwitchUser = z.infer<typeof STwitchUser>;

export async function getTwitchApiUser(
  username: string,
  token: string,
): Promise<TResponse<TWrappedResponse<TTwitchUser[]>>> {
  const url = interpolate(ID_URL, { username });

  try {
    const res = await ky.get(url, bearerTokenParams(token));

    const json = await res.json<TWrappedResponse<TTwitchUser[]>>();
    const data = SWrappedResponse(z.array(STwitchUser)).parse(json);

    return { success: true, data };
  } catch (e) {
    logger.error(`Failed to fetch user information for user ${username}`);
    console.log(e);
    return { success: false };
  }
}
