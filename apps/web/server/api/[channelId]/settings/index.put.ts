import { SSettings, SSettingsUpdate, TSettings } from "bellatrix";
import merge from "lodash.merge";
import mergeWith from "lodash.mergewith";

export default defineEventHandler(async (event) => {
  await requireAuthSession(event);

  const body = SSettingsUpdate.safeParse(await readBody(event));

  if (!body.success) {
    throw createError({
      statusCode: 401,
    });
  }

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

  const merged = mergeWith(parsed.data, body.data, (oldv: string | number | [], newv: unknown) => {
    if (Array.isArray(oldv) && Array.isArray(newv)) {
      return newv;
    }
  });

  const mergedParsed = SSettings.safeParse(merged);

  if (!mergedParsed.success) {
    throw createError({
      statusCode: 500,
    });
  }

  try {
    await prisma.webuiUser.update({
      where: { id: settings.id },
      data: { settings: mergedParsed.data },
    });

    return mergedParsed.data;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
