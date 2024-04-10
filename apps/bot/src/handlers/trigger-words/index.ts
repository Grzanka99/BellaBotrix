import type { TUseHandler } from "handlers/types";
import { prisma } from "services/db";

export function createTriggerWordsHandler(channelId: number): TUseHandler {
  return async ({ send, channel, message }): Promise<void> => {
    const triggers = await prisma.triggerWords.findMany({ where: { channelId } });
    console.log(channel, triggers);

    for (const trigger of triggers) {
      if (!trigger.enabled) {
        continue;
      }

      const splited = trigger.triggers.split(",");

      for (const one of splited) {
        if (message.includes(one.trim())) {
          send(trigger.response);
          return;
        }
      }
    }
  };
}
