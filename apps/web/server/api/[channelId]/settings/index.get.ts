import { SSettings, type TSettings } from "bellatrix";

export default defineEventHandler(async (event): Promise<TSettings> => {
  await requireAuthSession(event);

  const channel = await getChannelFromEvent(event);

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const settings = await prisma.webuiUser.findFirst({
    where: { channelId: channel.id },
  });

  if (!settings) {
    throw createError({
      statusCode: 404,
    });
  }

  const res =
    typeof settings.settings === "string" ? JSON.parse(settings.settings) : settings.settings;

  const parsed = SSettings.safeParse(res);

  if (!parsed.success) {
    throw createError({
      statusCode: 500,
    });
  }

  return parsed.data;
});
