import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { SoloList } from "./SoloList";

export const SoloLayout = async (ctx: Context) => {
  return (
    <PanelLayout current="/panel/solo" headers={<link rel="stylesheet" href="/public/solo.css" />}>
      <div id="solo-outer-wrapper">
        {await SoloList(ctx)}
      </div>
    </PanelLayout>
  );
};
