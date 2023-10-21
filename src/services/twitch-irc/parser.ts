import { TTwitchMessageInfo } from "services/types";
import { decodeEmotes } from "./emotes";

export function parseMessageInfo(data: string, message: string) {
  const splitted = data.split(";");
  const userInfo: TTwitchMessageInfo = {
    clientNonce: "",
    color: "",
    displayName: "",
    emotes: [],
    firstMessage: false,
    isMod: false,
    roomId: -1,
    isSubsriber: false,
    userId: -1,
    userType: "",
    badges: [],
  };

  for (let i = 0; i < splitted.length; i++) {
    const curr = splitted[i];
    if (curr.startsWith("badges=")) {
      userInfo.badges = curr.substring("badges=".length).split(",");
    } else if (curr.startsWith("client-nonce=")) {
      userInfo.clientNonce = curr.substring("client-nonce=".length);
    } else if (curr.startsWith("color=")) {
      userInfo.color = curr.substring("color=".length);
    } else if (curr.startsWith("display-name=")) {
      userInfo.displayName = curr.substring("display-name=".length);
    } else if (curr.startsWith("emotes=")) {
      userInfo.emotes = decodeEmotes(curr.substring("emotes=".length), message);
    } else if (curr.startsWith("first-msg=")) {
      userInfo.firstMessage = curr.substring("first-msg=".length) === "1";
    } else if (curr.startsWith("mod=")) {
      userInfo.isMod = curr.substring("mod=".length) === "1";
    } else if (curr.startsWith("room-id=")) {
      userInfo.roomId = Number(curr.substring("room-id=".length));
    } else if (curr.startsWith("subscriber=")) {
      userInfo.isSubsriber = curr.substring("subscriber=".length) === "1";
    } else if (curr.startsWith("user-id=")) {
      userInfo.userId = Number(curr.substring("user-id=".length));
    } else if (curr.startsWith("user-type=")) {
      userInfo.userType = curr.substring("user-type=".length);
    }
  }

  return userInfo;
}
