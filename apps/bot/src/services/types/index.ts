import type { TOption, TSettings } from "bellatrix";
import type { OllamaAI } from "services/ollama";
import type { R6Dle } from "services/r6dle";
import type { R6Stats } from "services/r6stats";
import type { TwitchApi } from "services/twitch-api";
import type { TCommand, TSubCommand } from "types/schema/commands.schema";

export type TTwitchApiChatter = {
  user_id: string;
  user_login: string;
  user_name: string;
};

export type TTwitchApiStream = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  tags: string[];
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  is_mature: boolean;
};

export type TTwitchMessageInfo = {
  clientNonce: string;
  color: string;
  displayName: string;
  emotes: Array<[string, string, number]>;
  firstMessage: boolean;
  username: string;
  isMod: boolean;
  roomId: number;
  isSubsriber: boolean;
  userId: string;
  userType: string;
  badges: Record<string, boolean> & {
    broadcaster?: boolean;
    subscriper?: boolean;
    premium?: boolean;
  };
};

export type TTwitchIrcCommand =
  | "JOIN"
  | "PART"
  | "NOTICE"
  | "CLEARCHAT"
  | "HOSTTARGET"
  | "PRIVMSG"
  | "PING"
  | "CAP"
  | "GLOBALUSERSTATE"
  | "USERSTATE"
  | "ROOMSTATE"
  | "RECONNECT"
  | "421"
  | "001"
  | "002"
  | "003"
  | "004"
  | "353"
  | "366"
  | "372"
  | "375"
  | "376"
  | "UNKNOWN"
  | (string & {});

export type TParsedCommandType = {
  command: TTwitchIrcCommand;
  channel: TOption<string>;
  isCapRequestEnabled: boolean;
};

export type TTwitchIrcSource = {
  username: TOption<string>;
  host: string;
};

export type TTwitchIrcContext = {
  type: TTwitchIrcCommand;
  command: TParsedCommandType;
  channel: TOption<string>;
  message: TOption<string>;
  isCommand?: boolean;
  self: boolean;
  tags: TOption<TTwitchMessageInfo>;
  source: TOption<TTwitchIrcSource>;
};

export type THandleCommadArgs = TTwitchIrcContext & {
  api: TwitchApi;
  settings: TSettings;
  r6dle: R6Dle;
  r6stats: R6Stats;
  ollamaAi: OllamaAI;
  send: (msg: string) => void;
};

export type THandleParsedCommandArgs = THandleCommadArgs & {
  parsedCommand: TCommand;
  triggerWord: string;
  tags: TTwitchMessageInfo;
};

export type THandleCoreCommandArgs = THandleParsedCommandArgs & {
  subCommand: false | TSubCommand;
  commandContent: string;
};
