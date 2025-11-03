import { z } from "zod";
import type { TAvailableModel } from "~/types/ai-settings.type";

const OpenrouterAPIModelResponse = z.object({
  data: z.array(z.any()),
});

export default defineEventHandler(async (event) => {
  const OPENROUTER_URL = process.env.OPENROUTER_API_URL;

  if (!OPENROUTER_URL) {
    throw createError({ statusCode: 500 });
  }

  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  try {
    const res = await fetch(`${OPENROUTER_URL}/models`);
    const parsed = OpenrouterAPIModelResponse.safeParse(await res.json());

    if (!parsed.success) {
      return [];
    }

    const final: TAvailableModel[] = parsed.data.data.map((el) => ({
      name: el.name,
      model: el.id,
      description: el.description,
      contextLength: el.context_length,
      pricing: `In: ${el.pricing.prompt}$ / Out: ${el.pricing.completion}$`,
    }));

    return final;
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
