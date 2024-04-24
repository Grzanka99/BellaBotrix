import type { TOption, TSettings } from "bellatrix";
import type { TwitchApi } from "services/twitch-api";
import { TCommand } from "types/schema/commands.schema";

export type TTwitchApiUser = {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
};

export type TTwitchApiChatter = {
  user_id: string;
  user_login: string;
  user_name: string;
};

export type TTwitchApiResponse<T> = {
  data: T;
  pagination: Record<string, string>;
};

export type TTwitchApiUnauthorized = {
  error: string;
  status: 401;
  message: string;
};

export type TTwitchOAuthRefresh = {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
};

export type TTwitchValidateToken = {
  client_id: string;
  login: string;
  scopes: string[];
  user_id: string;
  expires_in: number;
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

export enum EEvenType {
  Message = "message",
  Roomstate = "roomstate",
  Join = "join",
}

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
  send: (msg: string) => void;
};

export type THandleParsedCommandArgs = THandleCommadArgs & {
  parsedCommand: TCommand;
  triggerWord: string;
  tags: TTwitchMessageInfo;
};

export type THandleCoreCommandArgs = THandleParsedCommandArgs & {
  subCommand: false | string;
  commandContent: string;
};
