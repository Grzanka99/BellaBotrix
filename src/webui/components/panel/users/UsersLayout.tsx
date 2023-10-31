import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { UsersList } from "./UsersList";

export const UsersLayout = async (ctx: Context) => {
  return (
    <PanelLayout
      current="/panel/users"
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
