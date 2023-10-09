import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { UsersList } from "./UsersList";

export const UsersLayout = async (ctx: Context) => {
  return (
    <PanelLayout
      current="/panel/users"
      headers={<link rel="stylesheet" href="/public/users-list.css" />}
    >
      <div id="users-list-outer-wrapper">{await UsersList(ctx)}</div>
    </PanelLayout>
  );
};
