import { PanelLayout } from "../PanelLayout";
import { AddCommandForm } from "./AddCommandForm";
import { CommandsList } from "./CommandsList";

export const CommandsLayout = async () => {
  return (
    <PanelLayout
      current="/panel/commands"
      headers={<link rel="stylesheet" href="/public/commands-table.css" />}
    >
      <div>
        <h1>Commands</h1>
        <AddCommandForm />
        {await CommandsList()}
      </div>
    </PanelLayout>
  );
};
