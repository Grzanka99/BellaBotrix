import { getUniqueName } from "~/server/utils/command";
import { SCreateCommand } from "~/types/commands.type";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const parsed = SCreateCommand.safeParse(await readBody(event));

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

  const { name, message } = parsed.data;

  const uniqueName = getUniqueName(name, ch.name);

  const ifExists = await prisma.commands.findUnique({ where: { uniqueName } });
  if (ifExists) {
    throw createError({
      statusCode: 403,
      message: `Command: '${name}' already exists for channel: ${ch.name}`,
    });
  }

  const newCmd = await prisma.commands.create({
    data: {
      uniqueName,
      channelName: `#${ch.name}`,
      name,
      message: { base: message },
      enabled: true,
      alias: "",
    },
  });

  if (!newCmd) {
    throw createError({
      statusCode: 500,
    });
  }

  return newCmd;
});
