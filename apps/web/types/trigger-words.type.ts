import { z } from "zod";

export const SCreateTriggerWord = z.object({
  triggers: z.string(),
  response: z.string(),
});

export const SUpdateTriggerWord = z.object({
  id: z.coerce.number(),
  triggers: z.coerce.string().optional(),
  response: z.coerce.string().optional(),
  enabled: z.coerce.boolean().optional(),
});

export type TCreateTriggerWord = z.infer<typeof SCreateTriggerWord>;
export type TUpdateTriggerWord = z.infer<typeof SUpdateTriggerWord>;
