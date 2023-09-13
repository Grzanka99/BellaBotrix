import { ChatUserstate, Client } from "tmi.js";

export type TChatMessage = {
  author: string;
  content: string;
};

export type TTaxValues = {
  winningUser: string;
  loosingUser: string;
  points: number;
};

export type TCommand = {
  action: string;
  actionMessage: string | null;
  original: string;
};

export type THandlerArgs = {
  message: string;
  tags: ChatUserstate;
  client: Client;
  channel: string;
};

export type TUseHandler = (args: THandlerArgs) => Promise<void>;

export type THandler = {
  useHandler: TUseHandler;
};
