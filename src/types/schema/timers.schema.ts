import { z } from "zod";

export const TimerSchema = z.object({
  id: z.number(),
  channelId: z.number(),
  timeout: z.number(),
  message: z.string(),
});

export const TimersSchema = z.array(TimerSchema);

export type TTimer = z.infer<typeof TimerSchema>;
