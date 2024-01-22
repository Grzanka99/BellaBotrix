import { z } from "zod";

export const SUpdateTimer = z.object({
  id: z.coerce.number(),
  message: z.coerce.string().optional(),
  timeout: z.coerce.number().min(0).optional(),
});

export const SCreateTimer = z.object({
  message: z.coerce.string().refine((v) => v.length > 0),
  timeout: z.coerce.number().min(0),
});

export type TUpdateTimer = z.infer<typeof SUpdateTimer>;
export type TCreateTimer = z.infer<typeof SCreateTimer>;
