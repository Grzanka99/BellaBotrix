import { z } from "zod";

export const SCreateCommand = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
});

export type TCreateCommand = z.infer<typeof SCreateCommand>;

export const SUpdateCommand = z.object({
  id: z.coerce.number(),
  enabled: z.coerce.boolean().optional(),
  message: z.record<z.ZodString>(z.string()).optional(),
  alias: z.coerce.string().optional(),
});

export type TUpdateCommand = z.infer<typeof SUpdateCommand>;
