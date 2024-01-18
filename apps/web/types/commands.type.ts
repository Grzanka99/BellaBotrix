import { z } from "zod";

export const SCreateCommand = z.object({
  name: z.string().min(1),
  message: z.string().min(1),
});

export type TCreateCommand = z.infer<typeof SCreateCommand>;
