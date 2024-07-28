import { prisma, storage } from "shared";

export async function handleSettingsSync(channelId: number): Promise<boolean> {
  const [settings, channel] = await Promise.all([
    prisma.webuiUser.findFirst({
      where: { channelId: channelId },
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

  return true;
}
