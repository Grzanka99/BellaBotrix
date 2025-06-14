import {
  AIModelsSyncValidation,
  HandleAIModelsSync,
  HandleChannelsListUpdate,
  HandleIsLive,
  HandleSettingsSync,
  IsLiveValidation,
  SettingsSyncValidation,
} from "lib/handlers/unsafe";
import {
  type TUnsafeRoutesApp,
  NOTIFY_CHANNELS_LIST_UPDATE,
  UNSAFE_AIMODELS_SYNC,
  UNSAFE_IS_LIVE,
  UNSAFE_SETTINGS_SYNC,
} from "./types";

export function UnsafeRoutes(app: TUnsafeRoutesApp) {
  app.post(UNSAFE_SETTINGS_SYNC, HandleSettingsSync, SettingsSyncValidation);
  app.post(UNSAFE_AIMODELS_SYNC, HandleAIModelsSync, AIModelsSyncValidation);
  app.get(UNSAFE_IS_LIVE, HandleIsLive, IsLiveValidation);
  app.get(NOTIFY_CHANNELS_LIST_UPDATE, HandleChannelsListUpdate);

  return app;
}
