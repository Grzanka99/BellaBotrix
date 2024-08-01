import { z } from "zod";

export const SUpdateAISystemPromptDto = z.object({
  id: z.number(),
  name: z.string().optional(),
  text: z.string().optional(),
  orderDirection: z.union([z.literal("up"), z.literal("down")]).optional(),
  enabled: z.boolean().optional(),
});

export const SCreateAISystemPromptDto = z.object({});

export const SUpdateAIModelDto = z.object({
  id: z.number(),
  name: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
});

export const SCreateAIModelDto = z.object({
  name: z.string(),
  description: z.string(),
});

export type TAvailableModel = {
  name: string;
  model: string;
  parameterSize: string;
};

export type TUpdateAISystemPromptDto = z.infer<typeof SUpdateAISystemPromptDto>;
export type TCreateAISystemPromptDto = z.infer<typeof SCreateAISystemPromptDto>;
export type TUpdateAIModelDto = z.infer<typeof SUpdateAIModelDto>;
export type TCreateAIModelDto = z.infer<typeof SCreateAIModelDto>;
