import { Context } from "elysia";
import { prisma } from "services/db";
import { SingleUser } from "./SingleUser";
import { R_USERS } from "webui/routes";

export const SingleChannelUserList = async (ctx: Context, starting?: string) => {
  if (!starting && !ctx.query.channel && !ctx.query.channel?.length) {
    return undefined;
  }

  const users = await prisma.user.findMany({
    where: {
      channel: `#${String(starting || ctx.query.channel)}`,
    },
  });

  if (!users || !users.length) {
    return undefined;
  }

  return (
    <div
      id="channel-users-list"
      class="grid-based-table__content"
      hx-get={`${R_USERS.PREFIX}${R_USERS.LIST}?channel=${String(starting || ctx.query.channel)}`}
      hx-trigger="every 2s"
      hx-target="#channel-users-list"
      hx-swap="outerHTML"
    >
      {users.map((user) => (
        <SingleUser {...user} />
      ))}
    </div>
  );
};
