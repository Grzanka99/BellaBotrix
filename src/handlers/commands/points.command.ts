import { TCommand } from "handlers/types";
import { prisma } from "services/db";
import { TOption } from "types";
import { interpolate } from "utils/interpolate-string";

export async function getUserPoints(
  { original, actionMessage }: TCommand,
  sender?: string,
): Promise<TOption<string>> {
  if (!original || !actionMessage || !sender) {
    return undefined;
  }


  let resUsername = sender;
  let formattedUsername = sender;

  const username = original.match(/\@\S+/);

  if (username?.length && username[0]) {
    formattedUsername = username[0].replace("@", "").toLowerCase().trim();
    resUsername = username[0].replace("@", "");
  }

  const user = await prisma.user.findUnique({
    where: {
      username: formattedUsername,
    },
  });

  if (!user) {
    return interpolate(actionMessage, {
      username: `@${resUsername}`,
      points: 0,
    });
  }

  const msg = interpolate(actionMessage, {
    username: `@${resUsername}`,
    points: formattedUsername === sender ? user.points + 1 : user.points,
  });

  return msg;
}
