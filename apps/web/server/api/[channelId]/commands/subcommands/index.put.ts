import { SubCommands } from "@prisma/client";
import { SUpdateSubCommand } from "~/types/commands.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SUpdateSubCommand.safeParse(await readBody(event));

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const ch = await getChannelFromEvent(event);
  if (!ch) {
    throw createError({
      statusCode: 401,
    });
  }

  const { id, ...rest } = parsed.data;

  try {
    const updated = await prisma.subCommands.update({
      where: { id },
      data: rest,
    });

    // FIXME: Fix entries in DB to always be json
    return {
      ...updated,
      message: typeof updated.message === "string" ? JSON.parse(updated.message) : updated.message,
    } as SubCommands;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
