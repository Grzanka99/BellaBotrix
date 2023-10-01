export type TSingleUiCommand = {
  id: number;
  name: string;
  message: string | null;
  enabled: boolean;
  alias: string;
};

export type TSingleUiUser = {
  id: number;
  userid: string;
  username: string;
  channel: string;
  sentMessages: number;
  points: number;
}

export type TNewUiCommand = {
  name: string | undefined;
  message: string | undefined;
};
