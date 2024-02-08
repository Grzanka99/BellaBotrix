import { TTwitchMessageInfo as TTwitchTags } from "services/types";
import { parseBadges } from "./badges.parser";
import { parseEmotes } from "./emotes.parser";

export function parseTags(data: string, message: string): TTwitchTags {
  const splitted = data.split(";");
  const tags: TTwitchTags = {
    clientNonce: "",
    color: "",
    displayName: "",
    emotes: [],
    firstMessage: false,
    isMod: false,
    roomId: -1,
    isSubsriber: false,
    userId: "",
    userType: "",
    badges: {},
    username: "",
  };

  for (let i = 0; i < splitted.length; i++) {
    const [tag, value] = splitted[i].split("=");

    switch (tag) {
      case "badges":
        tags.badges = parseBadges(value.split(","));
        break;
      case "client-nonce":
        tags.clientNonce = value;
        break;
      case "color":
        tags.color = value;
        break;
      case "display-name":
        tags.username = value.toLowerCase();
        tags.displayName = value;
        break;
      case "emotes":
        tags.emotes = parseEmotes(value, message);
        break;
      case "first-msg":
        tags.firstMessage = value === "1";
        break;
      case "mod":
        tags.isMod = value === "1";
        break;
      case "room-id":
        tags.roomId = Number(value);
        break;
      case "subscriber":
        tags.isSubsriber = value === "1";
        break;
      case "user-id":
        tags.userId = value;
        break;
      case "user-type":
        tags.userType = value;
        break;
    }
  }

  return tags;
}
