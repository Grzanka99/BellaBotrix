import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { AddCommandForm } from "./AddCommandForm";
import { CommandsList } from "./CommandsList";
import { getChannelFromCtx } from "webui/helpers";

export const CommandsLayout = async (ctx: Context) => {
  const channel =await getChannelFromCtx(ctx);

  return (
    <PanelLayout
      current="/panel/commands"
      channel={channel?.name}
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
