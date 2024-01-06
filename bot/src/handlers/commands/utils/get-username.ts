export function getUsername(
  original: string,
  sender: string,
): [string, string] {
  let resUsername: string = sender;
  let formattedUsername: string = sender;

  const username = original.match(/\@\S+/);

  if (username?.length && username[0]) {
    formattedUsername = username[0].replace("@", "").toLowerCase().trim();
    resUsername = username[0].replace("@", "");
  }

  return [resUsername, formattedUsername];
}
