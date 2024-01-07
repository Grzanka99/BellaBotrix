import { Context } from "elysia";
import { TOption } from "types";
import { SoloListContent } from "./SoloListContent";
import { R_SOLO } from "webui/routes";

export const SoloList = async (ctx: Context): Promise<TOption<JSX.Element>> => {
  return (
    <div class="grid-based-table">
      <div
        class="grid-based-table__header"
        hx-get={`${R_SOLO.PREFIX}${R_SOLO.LIST}`}
        hx-trigger="every 5s"
        hx-target="#solo-users-list"
        hx-swap="innerHTML"
      >
        <ul>
          <li>id</li>
          <li>user 1</li>
          <li>user 2</li>
          <li>points</li>
          <li>winner</li>
          <li>in progress</li>
        </ul>
      </div>
      <div id="solo-users-list" class="grid-based-table__content">
        {await SoloListContent(ctx)}
      </div>
    </div>
  );
};
