import { PanelLayout } from "../PanelLayout";
import { UsersList } from "./UsersList";

export const UsersLayout = async () => {
  return (
    <PanelLayout
      current="/panel/users"
      headers={<link rel="stylesheet" href="/public/table.css" />}
    >
      <div>
        <h1>Users</h1>
        {await UsersList()}
      </div>
    </PanelLayout>
  );
};
