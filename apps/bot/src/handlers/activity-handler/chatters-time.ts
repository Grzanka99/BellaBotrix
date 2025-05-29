import { Prisma } from "@prisma/client";
import { prisma, prismaQueue } from "services/db";
import type { TTwitchApiChatter } from "services/types";

function toProperArrayInputString(users: string[]) {
  let res = "";
  for (const user of users) {
    res += `'${user}',`;
  }

  return res.substring(0, res.length - 1);
}

export async function chatterTimeHandler(
  channel: string,
  chatters: TTwitchApiChatter[],
): Promise<void> {
  const userslist: string[] = [];
  for (const chatter of chatters) {
    userslist.push(`${chatter.user_name.toLowerCase().trim()}:${chatter.user_id}@${channel}`);
  }

  const querystring = toProperArrayInputString(userslist);
  const query = Prisma.raw(`CALL increase_users_points(array[${querystring}])`);
  await prismaQueue.enqueue(() => prisma.$queryRaw(query));
}
