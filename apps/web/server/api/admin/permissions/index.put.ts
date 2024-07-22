import { getUserPerms } from "~/server/utils/db";
import {
  SUpdatePermissionsDto,
  type TPerms,
  type TPermissionEntry,
} from "~/types/permissions.type";

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);

  const perms = await getUserPerms(auth.data);

  if (!perms.includes("admin")) {
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

  const { id, perms: newPerms } = parsed.data;

  if (auth.data.id === id) {
    if (!newPerms.includes("admin") && perms.includes("admin")) {
      newPerms.push("admin");
    }

    if (!newPerms.includes("user") && perms.includes("user")) {
      newPerms.push("user");
    }
  }

  try {
    const updated = await prisma.webuiUser.update({
      where: { id },
      data: { perms: newPerms.join(",") },
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
      perms: updated.perms.split(",") as TPerms[],
      channel: channel?.name,
    } satisfies TPermissionEntry;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
