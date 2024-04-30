import { prisma } from "services/db";
import type { TTwitchIrcContext } from "services/types";

type Args = TTwitchIrcContext & { send: (msg: string) => void; channelId: number };

export async function triggerWordsHandler({ send, message, channelId }: Args): Promise<void> {
  if (!message) {
    return undefined;
  }
  const triggers = await prisma.triggerWords.findMany({ where: { channelId } });

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
}
