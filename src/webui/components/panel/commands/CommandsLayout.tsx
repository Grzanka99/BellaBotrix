import { PanelLayout } from "../PanelLayout";
import { AddCommandForm } from "./AddCommandForm";
import { CommandsList } from "./CommandsList";

export const CommandsLayout = async () => {
  return (
    <PanelLayout
      current="/panel/commands"
      headers={
        <>
          <link rel="stylesheet" href="/public/commands-table.css" />
          <link rel="stylesheet" href="/public/add-command-form.css" />
        </>
      }
    >
      <div>
        <AddCommandForm />
        {await CommandsList()}
      </div>
    </PanelLayout>
  );
};
