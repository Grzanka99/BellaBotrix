export function decodeEmotes(enocoded: string, message: string): Array<[string, string, number]> {
  if (!message) {
    return [];
  }
  const splitByEmote = enocoded.split("/");
  if (splitByEmote[0] === "") {
    return [];
  }

  const toIdEmoteTuple: Array<[string, string, number]> = splitByEmote.map((emote) => {
    const [id, occurances] = emote.split(":");
    const occurancesSplited = occurances.split(",");
    const [foi1, foi2] = occurancesSplited[0].split("-");
    const emoteName = message.substring(Number(foi1), Number(foi2) + 1);

    return [id, emoteName, occurancesSplited.length];
  });

  console.log(toIdEmoteTuple);

  return toIdEmoteTuple;
}
