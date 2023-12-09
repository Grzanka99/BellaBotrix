import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { SoloList } from "./SoloList";
import { getChannelFromCtx } from "webui/helpers";

export const SoloLayout = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);
  return (
    <PanelLayout
      channel={channel?.name}
      current="/panel/solo"
      headers={<link rel="stylesheet" href="/public/solo.css" />}
    >
      <div id="solo-outer-wrapper">{await SoloList(ctx)}</div>
    </PanelLayout>
  );
};
