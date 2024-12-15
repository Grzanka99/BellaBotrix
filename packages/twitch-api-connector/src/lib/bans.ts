import ky from "ky";
import type { TResponse } from "types";
import { bearerTokenParams, logger } from "utils";
import { z } from "zod";

const SApiBan = z.object({
  data: z.array(
    z.object({
      broadcaster_id: z.string(),
      moderator_id: z.string(),
      user_id: z.string(),
      created_at: z.string(),
      end_time: z.null(),
    }),
  ),
});

type TBanBody = {
  data: {
    user_id: string;
    reason: string;
  };
};

type TApiBan = z.infer<typeof SApiBan>;

export async function banUser(
  moderator_id: string,
  token: string,
  userid: string,
  reason?: string,
): Promise<TResponse<TApiBan>> {
  const url = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${moderator_id}&moderator_id=${moderator_id}`;

  const jsonbody = JSON.stringify({
    data: {
      user_id: userid,
      reason: reason || "no reason",
    },
  } as TBanBody);

  try {
    const res = await ky.post(url, {
      headers: {
        ...bearerTokenParams(token).headers,
        "Content-Type": "application/json",
      },
      body: jsonbody,
    });

    const data = SApiBan.parse(await res.json<TApiBan>());

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to ban user");
    console.log(e);
    return { success: false };
  }
}

export async function unbanUser(
  moderator_id: string,
  token: string,
  userid: string,
): Promise<TResponse<boolean>> {
  const url = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${moderator_id}&moderator_id=${moderator_id}&user_id=${userid}`;

  try {
    await ky.delete(url, bearerTokenParams(token));

    return {
      success: true,
      data: true,
    };
  } catch (e) {
    logger.error("Failed to unban user");
    console.log(e);
    return { success: false };
  }
}
