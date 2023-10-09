import { prisma } from "services/db";
import { R_USERS } from "webui/routes";
import { SingleChannelUserList } from "./SingleChannelUsers";
import { Context } from "elysia";

export const UsersList = async (ctx: Context) => {
  const channels = await prisma.channel.findMany();

  if (!channels || !channels.length) {
    return undefined;
  }

  return (
    <>
      <select
        name="channel"
        hx-get={`${R_USERS.PREFIX}${R_USERS.LIST}`}
        hx-target="#channel-users-list"
        hx-swap="outerHTML"
        autocomplete="off"
      >
        {channels.map((ch, i) => (
          <option value={ch.name} selected={i === 0 ? "selected" : undefined}>
            {ch.name}
          </option>
        ))}
      </select>
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
        {await SingleChannelUserList(ctx, channels[0].name)}
      </div>
    </>
  );
};
