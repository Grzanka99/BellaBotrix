import { z } from "zod";

export const SUpdateAISystemPromptDto = z.object({
  id: z.number(),
  name: z.string().optional(),
  text: z.string().optional(),
  orderDirection: z.union([z.literal("up"), z.literal("down")]).optional(),
  enabled: z.boolean().optional(),
});

export const SCreateAISystemPromptDto = z.object({});

export type TUpdateAISystemPromptDto = z.infer<typeof SUpdateAISystemPromptDto>;
export type TCreateAISystemPromptDto = z.infer<typeof SCreateAISystemPromptDto>;
