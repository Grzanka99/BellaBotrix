import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { UsersList } from "./UsersList";
import { getChannelFromCtx } from "webui/helpers";

export const UsersLayout = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);
  return (
    <PanelLayout
      current="/panel/users"
      channel={channel?.name}
      headers={<link rel="stylesheet" href="/public/users-list.css" />}
    >
      <div>
        <div class="users-list-controls">
          <label class="styled-input-with-label">
            Search: <input id="users-list-filter" name="search" type="text" />
          </label>
        </div>
        {await UsersList(ctx)}
      </div>
    </PanelLayout>
  );
};
