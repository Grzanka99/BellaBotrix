import ky from "ky";
import type { TResponse } from "types";
import { logger } from "utils";
import { z } from "zod";

const SValidateToken = z.object({
  client_id: z.string(),
  login: z.string(),
  scopes: z.array(z.string()),
  user_id: z.string(),
  expires_in: z.string(),
});

type TValidateToken = z.infer<typeof SValidateToken>;

export async function validateToken(token: string): Promise<TResponse<TValidateToken>> {
  const url = "https://id.twitch.tv/oauth2/validate";
  try {
    const res = await ky.get(url, {
      headers: {
        Authorization: `OAuth ${token}`,
      },
    });

    const data = SValidateToken.parse(await res.json());

    return {
      success: true,
      data,
    };
  } catch (e) {
    logger.error("Failed to validate token");
    console.log(e);
    return { success: false };
  }
}
