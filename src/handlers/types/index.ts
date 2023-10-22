import { TwitchIrc } from "services/twitch-irc";
import { TTwitchMessageInfo } from "services/types";

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
  tags: TTwitchMessageInfo;
  client: TwitchIrc;
  channel: string;
};

export type TUseHandler = (args: THandlerArgs) => Promise<void>;

export type THandler = {
  useHandler: TUseHandler;
};

export enum EWonLost {
  Won = "Won",
  Lost = "Lost",
  SuperWon = "SuperWon",
  ExtremeWon = "ExtremeWon",
}
