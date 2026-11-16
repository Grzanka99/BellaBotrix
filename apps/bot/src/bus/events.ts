import type { TTwitchIrcContext } from "services/types";

// NOTE: channel is always the "#name" form used by the IRC layer
export type TBotEvent =
  | { type: "chat.message"; channel: string; ctx: TTwitchIrcContext }
  | { type: "user.joined"; channel: string; ctx: TTwitchIrcContext }
  | { type: "stream.started"; channel: string; startedAt: string; streamerId: string }
  | { type: "stream.ended"; channel: string }
  // NOTE: one type with a flag, so one subscription orders enable/disable of the same channel
  | { type: "channel.changed"; channel: string; enabled: boolean }
  // NOTE: tick is not per channel, "global" is only there because bus lanes need a channel key
  | { type: "tick"; channel: "global"; now: number };

export type TBotEventType = TBotEvent["type"];

export type TBotEventOf<T extends TBotEventType> = Extract<TBotEvent, { type: T }>;
