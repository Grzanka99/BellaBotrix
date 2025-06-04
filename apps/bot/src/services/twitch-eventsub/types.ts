import { z } from "zod";

export const SEventSubMetadata = z.object({
  message_id: z.string(),
  message_type: z.string(),
  message_timestamp: z.string(),
});

export const SEventSubGeneralMessage = z.object({
  metadata: SEventSubMetadata,
  payload: z.record(z.any()),
});
