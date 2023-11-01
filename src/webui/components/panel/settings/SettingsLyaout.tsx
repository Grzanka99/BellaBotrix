import { Context } from "elysia";
import { PanelLayout } from "../PanelLayout";
import { SettingsForm } from "./SettingsForm";

export const SettingsLayout = async (ctx: Context) => {
  return (
    <PanelLayout
      current="/panel/settings"
      headers={<link rel="stylesheet" href="/public/settings.css" />}
    >
      <div id="settings-page">{await SettingsForm(ctx)}</div>
    </PanelLayout>
  );
};
