import type { TSettings } from "bellatrix";
import type { TChatMessage, THandler } from "handlers/types";
import type { TwitchApi } from "services/twitch-api";
import type { TTwitchMessageInfo } from "services/types";
import { createActivityHandler } from "./activity-handler";
import { createCommandHandler } from "./commands";
import { identifyIsBotCommand } from "./commands/identify-message";
import { createTriggerWordsHandler } from "./trigger-words";

type TProps = {
  channel: string;
  tags: TTwitchMessageInfo;
  message: string;
  settings: TSettings | undefined;
  api?: TwitchApi;
  channelId: number | undefined;
};

export async function getChatHandler({
  channel,
  tags,
  message,
  settings,
  api,
  channelId,
}: TProps): Promise<THandler[]> {
  const handlers: THandler[] = [{ useHandler: createActivityHandler() }];

  if (!tags.username) {
    return handlers;
  }

  const chatMessage: TChatMessage = {
    author: tags.username,
    content: message,
  };

  if (api && settings?.commands.enabled.value) {
    const isCommand = await identifyIsBotCommand(
      chatMessage.content,
      channel,
      settings?.commands.prefix.value,
    );

    if (isCommand) {
      handlers.push({ useHandler: createCommandHandler(isCommand, api) });
    }
  }

  if (channelId && api && settings?.triggerWords.enabled.value) {
    handlers.push({ useHandler: createTriggerWordsHandler(channelId) });
  }
  return handlers;
}
