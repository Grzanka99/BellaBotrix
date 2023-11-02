export type TSingleUiCommand = {
  id: number;
  name: string;
  message: string | null;
  enabled?: boolean;
  alias: string;
};

export type TSingleUiUser = {
  id: number;
  userid: string;
  username: string;
  channel: string;
  sentMessages: number;
  points: number;
};

export type TNewUiCommand = {
  channelName: string | undefined;
  name: string | undefined;
  message: string | undefined;
};

export type TSingleUiSolo = {
  id: number;
  user1: string;
  user2: string;
  channel: string;
  inProgress: boolean;
  points: number;
  winner: string | null;
};

export type TSingleUiSoloReq = {
  id: string;
  user1: string;
  user2: string;
  channel: string;
  inProgress: string;
  points: string;
  winner: string;
};
