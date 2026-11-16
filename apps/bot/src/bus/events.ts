import type { TTwitchIrcContext } from "services/types";

// NOTE: channel is always the "#name" form used by the IRC layer
export type TBotEvent =
  | { type: "chat.message"; channel: string; ctx: TTwitchIrcContext }
  | { type: "user.joined"; channel: string; ctx: TTwitchIrcContext }
  | { type: "stream.started"; channel: string; startedAt: string; streamerId: string }
  | { type: "stream.ended"; channel: string };

export type TBotEventType = TBotEvent["type"];

export type TBotEventOf<T extends TBotEventType> = Extract<TBotEvent, { type: T }>;
