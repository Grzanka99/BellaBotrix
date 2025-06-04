import ky from "ky";
import type { TResponse, TWrappedResponse } from "types";
import { bearerTokenParams, logger } from "utils";
import { z } from "zod";

const SApiChatters = z.array(
  z.object({
    user_id: z.string(),
    user_login: z.string(),
    user_name: z.string(),
  }),
);

type TApiChatters = z.infer<typeof SApiChatters>;

export async function getModerators(
  userid: string,
  token: string,
): Promise<TResponse<TApiChatters>> {
  const url = `https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${userid}`;

  try {
    const res = await ky.get(url, bearerTokenParams(token));

    const json = await res.json<TWrappedResponse<TApiChatters[]>>();

    const data = SApiChatters.parse(json.data);

    return { success: true, data };
  } catch (e) {
    logger.error("Failed to fetch moderators");
    console.log(e);
    return { success: false };
  }
}
