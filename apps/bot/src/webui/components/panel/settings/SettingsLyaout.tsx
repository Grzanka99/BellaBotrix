import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { SettingsForm } from "./SettingsForm";
import { ChannelAccessForm } from "./ChannelAccessForm";
import { ChangeChannelForm } from "./ChangeChannelForm";
import { getChannelFromCtx } from "webui/helpers";

export const SettingsLayout = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);
  return (
    <PanelLayout
      channel={channel?.name}
      current="/panel/settings"
      headers={<link rel="stylesheet" href="/public/settings.css" />}
    >
      <div id="settings-page">
        <h2 style={{ color: "red" }}>
          Currently changing channel doesn't affect settings and auth page!
        </h2>
        {await ChangeChannelForm(ctx)}
        {await SettingsForm(ctx)}
        {await ChannelAccessForm(ctx)}
      </div>
    </PanelLayout>
  );
};
