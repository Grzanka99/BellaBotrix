import ky from "ky";
import { SWrappedResponse, type TResponse, type TWrappedResponse } from "types";
import { bearerTokenParams, logger } from "utils";
import { z } from "zod";

const SFollower = z.object({
  user_id: z.coerce.string(),
  user_name: z.string(),
  user_loging: z.string(),
  followed_at: z.string(),
});

type TFollower = z.infer<typeof SFollower>;

export async function getChannelFollowers(
  userid: string,
  token: string,
  startAt: string | undefined = undefined,
): Promise<TResponse<TWrappedResponse<TFollower[]>>> {
  const url = `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${userid}&moderator_id=${userid}&first=100&after=${
    startAt || ""
  }`;

  try {
    const res = await ky.get(url, bearerTokenParams(token));

    const json = await res.json<TWrappedResponse<TFollower[]>>();
    const data = SWrappedResponse(z.array(SFollower)).parse(json.data);

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to fetch channel followers");
    console.log(e);
    return { success: false };
  }
}
