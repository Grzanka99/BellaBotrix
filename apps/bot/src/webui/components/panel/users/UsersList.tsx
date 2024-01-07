import { R_USERS } from "webui/routes";
import { SingleChannelUserList } from "./SingleChannelUsers";
import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";

export const UsersList = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    return undefined;
  }

  return (
    <div id="users-list-outer-wrapper">
      <div
        class="grid-based-table"
        hx-get={`${R_USERS.PREFIX}${R_USERS.LIST}?channel=${String(
          channel.name || ctx.query.channel,
        )}`}
        hx-trigger="every 5s"
        hx-target="#channel-users-list"
        hx-swap="innerHTML"
        hx-include="#users-list-filter"
      >
        <div class="grid-based-table__header">
          <ul>
            <li>userid</li>
            <li>username</li>
            <li>channel</li>
            <li>sent</li>
            <li>points</li>
            <li>is bot</li>
          </ul>
        </div>
        <div id="channel-users-list" class="grid-based-table__content">
          {await SingleChannelUserList(ctx, channel.name)}
        </div>
      </div>
    </div>
  );
};
