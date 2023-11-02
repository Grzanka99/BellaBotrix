import { TChatMessage, THandler } from "handlers/types";
import { identifyIsBotCommand } from "./commands/identify-message";
import { createCommandHandler } from "./commands";
import { createActivityHandler } from "./activity-handler";
import { TwitchApi } from "services/twitch-api";
import { TTwitchMessageInfo } from "services/types";
import { TSettings } from "types/schema/settings.schema";

type TProps = {
  channel: string;
  tags: TTwitchMessageInfo;
  message: string;
  settings: TSettings | undefined;
  api?: TwitchApi;
};

export async function getChatHandler({
  channel,
  tags,
  message,
  settings,
  api,
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

  return handlers;
}
