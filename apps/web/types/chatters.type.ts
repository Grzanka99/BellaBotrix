import { z } from "zod";

export const SUpdateChatter = z.object({
  id: z.coerce.number(),
  isBot: z.coerce.boolean(),
});

export type TUpdateChatter = z.infer<typeof SUpdateChatter>;
