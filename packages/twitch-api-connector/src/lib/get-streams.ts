import ky from "ky";
import { SWrappedResponse, type TResponse, type TWrappedResponse } from "types";
import { bearerTokenParams, logger } from "utils";
import { z } from "zod";

const SStream = z.object({
  id: z.string(),
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
  game_id: z.string(),
  game_name: z.string(),
  type: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
  viewer_count: z.number(),
  started_at: z.string(),
  language: z.string(),
  thumbnail_url: z.string(),
  is_mature: z.boolean(),
});

type TStream = z.infer<typeof SStream>;

export async function getStreams(
  userid: string,
  token: string,
): Promise<TResponse<TWrappedResponse<TStream[]>>> {
  const url = `https://api.twitch.tv/helix/streams?user_id=${userid}`;

  try {
    const res = await ky.get(url, bearerTokenParams(token));
    const json = await res.json<TWrappedResponse<TStream[]>>();
    const data = SWrappedResponse(z.array(SStream)).parse(json);

    return { success: true, data };
  } catch (e) {
    logger.error("Failed to fetch streams");
    console.log(e);
    return { success: false };
  }
}
