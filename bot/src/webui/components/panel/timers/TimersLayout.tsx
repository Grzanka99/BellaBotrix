import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { PanelLayout } from "../PanelLayout";
import { TimersListContent } from "./TimersListContent";
import { AddTimerForm } from "./AddTimerForm";

export const TimersLayout = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  return (
    <PanelLayout
      channel={channel?.name}
      current="/panel/timers"
      headers={<link rel="stylesheet" href="/public/timers.css" />}
    >
      <div>
        <AddTimerForm />
        <div id="timers-page">
          <div class="grid-based-table" id="timers-list-table">
            <div class="grid-based-table__header">
              <ul>
                <li>message</li>
                <li title="In Seconds, set to 0 to disable">timeout</li>
                <li />
                <li />
              </ul>
            </div>
            <div id="timers-list" class="grid-based-table__content">
              {await TimersListContent(ctx)}
            </div>
          </div>
        </div>
      </div>
    </PanelLayout>
  );
};
