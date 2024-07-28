import { z } from "zod";
import type { TAvailableModel } from "~/types/ai-settings.type";

const OllamaAPIModel = z.object({
  name: z.string(),
  model: z.string(),
  modified_at: z.string(),
  size: z.number(),
  digest: z.string(),
  details: z.object({
    parent_model: z.string(),
    format: z.string(),
    family: z.string(),
    families: z.array(z.string()),
    parameter_size: z.string(),
    quantization_level: z.string(),
  }),
});

const OllamaAPIModelResponse = z.object({
  models: z.array(OllamaAPIModel),
});

export default defineEventHandler(async (event) => {
  const OLLAMA_API = process.env.OLLAMA_API_URL;

  if (!OLLAMA_API) {
    throw createError({ statusCode: 500 });
  }

  const auth = await useAuthSession(event);
  const perms = await getUserPerms(auth.data);

  if (!checkPerms(perms, ["admin"])) {
    throw createError({ statusCode: 401 });
  }

  try {
    const res = await fetch(`${OLLAMA_API}/api/tags`);
    const parsed = OllamaAPIModelResponse.safeParse(await res.json());

    if (!parsed.success) {
      return [];
    }

    return parsed.data.models.map((el) => ({
      name: el.name,
      model: el.model,
      parameterSize: el.details.parameter_size,
    })) satisfies TAvailableModel[];
  } catch (_) {
    throw createError({ statusCode: 500 });
  }
});
