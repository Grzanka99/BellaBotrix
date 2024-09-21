import { t } from "elysia";
import { SYNC_KEY } from "env";
import type { TUnsafeRouteContext, UNSAFE_SETTINGS_SYNC } from "routes/unsafe/types";
import { prisma, storage } from "shared";

export const SettingsSyncValidation = {
  body: t.Object({
    key: t.String(),
  }),
  params: t.Object({
    channel: t.Number(),
  }),
};

export function HandleSettingsSync(
  ctx: TUnsafeRouteContext<typeof UNSAFE_SETTINGS_SYNC, typeof SettingsSyncValidation>,
) {
  const { params, error, body } = ctx;

  if (body.key !== SYNC_KEY) {
    return error(401);
  }

  const channelId = params.channel;

  (async () => {
    const [settings, channel] = await Promise.all([
      prisma.webuiUser.findFirst({
        where: { channelId },
        select: { settings: true },
      }),
      prisma.channel.findUnique({
        where: { id: channelId },
        select: { name: true },
      }),
    ]);

    if (!settings || !channel) {
      return false;
    }

    const settingsKey = `#${channel.name}-settings`;
    storage.set(settingsKey, settings.settings);
  })();

  return {
    success: true,
  };
}
