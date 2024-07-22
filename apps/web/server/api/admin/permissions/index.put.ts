import { SUpdatePermissionsDto, type TPermissionEntry } from "~/types/permissions.type";

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  if (!auth.data.perms.includes("admin")) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }

  const parsed = SUpdatePermissionsDto.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const { id, perms } = parsed.data;

  if (auth.data.id === id) {
    if (!perms.includes("admin") && auth.data.perms.includes("admin")) {
      perms.push("admin");
    }

    if (!perms.includes("user") && auth.data.perms.includes("user")) {
      perms.push("user");
    }
  }

  try {
    const updated = await prisma.webuiUser.update({
      where: { id },
      data: { perms: perms.join(",") },
      select: {
        id: true,
        perms: true,
        username: true,
        channelId: true,
      },
    });

    const channel = await prisma.channel.findUnique({
      where: { id: updated.channelId },
    });

    return {
      id: updated.id,
      username: updated.username,
      perms: updated.perms.split(","),
      channel: channel?.name,
    } satisfies TPermissionEntry;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
