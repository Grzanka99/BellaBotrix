import type { TPermissionEntry } from "~/types/permissions.type";

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("admin")) {
    throw createError({
      message: "Unauthorized",
      status: 401,
    });
  }

  const [webuiUsers, channels] = await Promise.all([
    prisma.webuiUser.findMany({
      select: {
        id: true,
        perms: true,
        username: true,
        channelId: true,
      },
    }),
    prisma.channel.findMany({
      select: {
        id: true,
        name: true,
        enabled: true,
      },
    }),
  ]);

  const merged: TPermissionEntry[] = [];

  for (const user of webuiUsers) {
    const channel = channels.find((el) => el.id === user.channelId);
    merged.push({
      id: user.id,
      username: user.username,
      perms: user.perms.split(","),
      channel: channel?.name,
    });
  }

  return merged;
});
