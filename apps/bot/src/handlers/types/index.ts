import { TwitchIrc } from "services/twitch-irc";
import { TTwitchMessageInfo } from "services/types";
import { TSettings } from "types/schema/settings.schema";

export type TChatMessage = {
  author: string;
  content: string;
};

export type TTaxValues = {
  winningUser: string;
  loosingUser: string;
  points: number;
};

export type TWithCommandHandler = {
  action: string;
  actionMessage: Record<"base" | (string & {}), string | undefined>;
  original: string;
};

export type THandlerArgs = {
  message: string;
  tags: TTwitchMessageInfo;
  send: (msg: string) => void;
  channel: string;
  settings: TSettings | undefined;
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
