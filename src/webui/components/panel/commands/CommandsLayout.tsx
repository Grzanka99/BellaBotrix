import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { AddCommandForm } from "./AddCommandForm";
import { CommandsList } from "./CommandsList";

export const CommandsLayout = async (ctx: Context) => {
  return (
    <PanelLayout
      current="/panel/commands"
      headers={
        <>
          <link rel="stylesheet" href="/public/commands-list.css" />
        </>
      }
    >
      <div>
        {await AddCommandForm(ctx)}
        <div class="grid-based-table" id="commands-list-table">
          <div class="grid-based-table__header">
            <ul>
              <li>name</li>
              <li>enabled</li>
              <li>message</li>
              <li>aliases</li>
            </ul>
          </div>
          <div id="commands-list" class="grid-based-table__content">
            {await CommandsList(ctx)}
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};
