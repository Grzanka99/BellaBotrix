import { TParsedCommandType, TTwitchIrcCommand } from "services/types";

export function parseCommandComponent(rawComponent: string): TParsedCommandType {
  const parsedCommand: TParsedCommandType = {
    command: "UNKNOWN",
    channel: undefined,
    isCapRequestEnabled: false,
  };

  const commandsParts = rawComponent.split(" ");

  switch (commandsParts[0] as TTwitchIrcCommand) {
    case "JOIN":
    case "PART":
    case "NOTICE":
    case "CLEARCHAT":
    case "HOSTTARGET":
    case "PRIVMSG": {
      parsedCommand.command = commandsParts[0];
      parsedCommand.channel = commandsParts[1];
      break;
    }
    case "PING": {
      parsedCommand.command = commandsParts[0];
      break;
    }
    case "CAP": {
      parsedCommand.command = commandsParts[0];
      parsedCommand.isCapRequestEnabled = commandsParts[2] === "ACL";
      break;
    }
    case "GLOBALUSERSTATE": {
      parsedCommand.command = commandsParts[0];
      break;
    }
    case "USERSTATE":
    case "ROOMSTATE": {
      parsedCommand.command = commandsParts[0];
      parsedCommand.channel = commandsParts[1];
      break;
    }
    case "RECONNECT": {
      parsedCommand.command = commandsParts[0];
      break;
    }
    case "001": {
      parsedCommand.command = commandsParts[0];
      parsedCommand.channel = commandsParts[1];
      break;
    }
    default: {
      parsedCommand.command = commandsParts[0];
    }
  }

  return parsedCommand;
}
