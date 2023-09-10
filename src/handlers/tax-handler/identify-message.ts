import { TChatMessage, TTaxValues } from "handlers/types";
import { TOption } from "types";

const AUTHORS = ["streamlabs", "wannacry_tm"];

export function identifyIsTaxMessage(
  msg: TChatMessage,
): TOption<TTaxValues> {
  if (!AUTHORS.includes(msg.author)) {
    return undefined;
  }

  if (msg.content[0] !== "@") {
    return undefined;
  }

  if (!msg.content.includes("wygrał przed garażami z")) {
    return undefined;
  }

  const winningUser = msg.content.substring(0, msg.content.indexOf(" "));
  const loosingUser = msg.content.substring(
    msg.content.lastIndexOf("@"),
    msg.content.indexOf(" i wygrał"),
  );

  if (winningUser === "" || loosingUser === "") {
    return undefined;
  }

  const points = parseInt(
    msg.content.substring(
      msg.content.indexOf(`${loosingUser} i wygrał`) + loosingUser.length + 9,
      msg.content.indexOf(" points"),
    ),
  );

  if (!points) {
    return undefined;
  }

  return {
    winningUser,
    loosingUser,
    points,
  };
}
