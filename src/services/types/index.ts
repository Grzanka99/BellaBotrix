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
  username: string,
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

export type TTwitchIrcContext = {
  type: EEvenType;
  channel: string;
  message: string;
  isCommand?: boolean;
  self: boolean;
  tags: TTwitchMessageInfo;
};
