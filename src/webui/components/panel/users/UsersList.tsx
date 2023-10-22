import { prisma } from "services/db";
import { R_USERS } from "webui/routes";
import { SingleChannelUserList } from "./SingleChannelUsers";
import { Context } from "elysia";

export const UsersList = async (ctx: Context) => {
  const username = String(ctx.cookie.auth.value.username);
  if (!username || !username.length) {
    return undefined;
  }

  const channel = await prisma.channel.findUnique({
    where: {
      id: (
        await prisma.webuiUser.findUnique({
          where: { username },
        })
      )?.channelId,
    },
  });

  if (!channel) {
    return undefined;
  }

  return (
    <>
      <div class="grid-based-table">
        <div class="grid-based-table__header">
          <ul>
            <li>userid</li>
            <li>username</li>
            <li>channel</li>
            <li>sent</li>
            <li>points</li>
          </ul>
        </div>
        {await SingleChannelUserList(ctx,channel.name)}
      </div>
    </>
  );
};
