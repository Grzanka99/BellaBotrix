import { TChatMessage, THandler } from "handlers/types";
import { ChatUserstate } from "tmi.js";
import { identifyIsTaxMessage } from "./tax-handler/identify-message";
import { createTaxHandler } from "./tax-handler";
import { identifyIsBotCommand } from "./commands/identify-message";
import { createCommandHandler } from "./commands";
import { createActivityHandler } from "./activity-handler";
import { TwitchApi } from "services/twitch-api";

export async function getChatHandler(
  _channel: string,
  tags: ChatUserstate,
  message: string,
  api?: TwitchApi,
): Promise<THandler[]> {
  const handlers: THandler[] = [{ useHandler: createActivityHandler() }];

  if (tags["message-type"] !== "chat" || !tags.username) {
    return handlers;
  }

  const chatMessage: TChatMessage = {
    author: tags.username,
    content: message,
  };

  const isMessageToTax = identifyIsTaxMessage(chatMessage);
  if (isMessageToTax) {
    handlers.push({ useHandler: createTaxHandler(isMessageToTax) });
  }

  const isCommand = await identifyIsBotCommand(chatMessage.content);
  if (isCommand) {
    handlers.push({ useHandler: createCommandHandler(isCommand, api) });
  }

  return handlers;
}
