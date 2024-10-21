import { API_CLIENT_ID } from "env";
import ky from "ky";
import { SWrappedResponse, type TResponse, type TWrappedResponse } from "types";
import { bearerTokenParams, logger } from "utils";
import { z } from "zod";

const SApiChatter = z.object({
  user_id: z.string(),
  user_login: z.string(),
  user_name: z.string(),
});

type TApiChatter = z.infer<typeof SApiChatter>;

export async function getChatters(
  userid: string,
  token: string,
): Promise<TResponse<TWrappedResponse<TApiChatter[]>>> {
  const url = `https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${userid}&moderator_id=${userid}`;

  try {
    const res = await ky.get(url, bearerTokenParams(token));
    const json = await res.json<TWrappedResponse<TApiChatter[]>>();
    const data = SWrappedResponse(z.array(SApiChatter)).parse(json);

    return { success: true, data };
  } catch (e) {
    logger.error("Failed to fetch chatters");
    console.log(e);
    return { success: false };
  }
}
