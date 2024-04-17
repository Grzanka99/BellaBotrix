import { TOption } from "bellatrix";
import { TTwitchIrcContext } from "services/types";
import { parseCommandComponent } from "./command-component.parse";
import { parseSourceComponent } from "./source-components.parser";
import { parseTags } from "./tags.parser";

export function parseMessage(rawMessage: string): TOption<TTwitchIrcContext> {
  let idx = 0;
  let endIdx = 0;

  let rawTagsComponent: TOption<string> = undefined;
  let rawSourceComponent: TOption<string> = undefined;
  let rawCommandComponent: TOption<string> = undefined;
  let rawParametersComponent: TOption<string> = undefined;

  if (rawMessage[idx] === "@") {
    endIdx = rawMessage.indexOf(" ");
    rawTagsComponent = rawMessage.slice(1, endIdx);
    idx = endIdx + 1;
  }

  if (rawMessage[idx] === ":") {
    idx += 1;
    endIdx = rawMessage.indexOf(" ", idx);
    rawSourceComponent = rawMessage.slice(idx, endIdx);
    idx = endIdx + 1;
  }

  endIdx = rawMessage.indexOf(":", idx);
  if (endIdx === -1) {
    endIdx = rawMessage.length;
  }

  rawCommandComponent = rawMessage.slice(idx, endIdx).trim();

  if (endIdx !== rawMessage.length) {
    idx = endIdx + 1;
    rawParametersComponent = rawMessage.slice(idx);
  }

  const command = parseCommandComponent(rawCommandComponent);
  const message = command.command === "PRIVMSG" ? rawParametersComponent?.trim() : undefined;
  const tags = rawTagsComponent ? parseTags(rawTagsComponent, message || "") : undefined;

  return {
    self: tags?.username === "bellabotrix",
    type: command.command,
    channel: command.channel,
    command,
    message,
    tags,
    source: parseSourceComponent(rawSourceComponent),
  };
}
