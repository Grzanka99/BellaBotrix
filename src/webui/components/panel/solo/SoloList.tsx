import { Context } from "elysia";
import { TOption } from "types";
import { SoloListContent } from "./SoloListContent";

export const SoloList = async (ctx: Context): Promise<TOption<JSX.Element>> => {
  return (
    <div class="grid-based-table">
      <div class="grid-based-table__header">
        <ul>
          <li>id</li>
          <li>user 1</li>
          <li>user 2</li>
          <li>points</li>
          <li>winner</li>
          <li>in progress</li>
        </ul>
      </div>
      {await SoloListContent(ctx)}
    </div>
  );
};
