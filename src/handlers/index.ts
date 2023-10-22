import { TChatMessage, THandler } from "handlers/types";
import { identifyIsBotCommand } from "./commands/identify-message";
import { createCommandHandler } from "./commands";
import { createActivityHandler } from "./activity-handler";
import { TwitchApi } from "services/twitch-api";
import { TTwitchMessageInfo } from "services/types";

export async function getChatHandler(
  _channel: string,
  tags: TTwitchMessageInfo,
  message: string,
  api?: TwitchApi,
): Promise<THandler[]> {
  const handlers: THandler[] = [{ useHandler: createActivityHandler() }];

  if (!tags.username) {
    return handlers;
  }

  const chatMessage: TChatMessage = {
    author: tags.username,
    content: message,
  };

  const isCommand = await identifyIsBotCommand(chatMessage.content);
  if (isCommand && api) {
    handlers.push({ useHandler: createCommandHandler(isCommand, api) });
  }

  return handlers;
}
