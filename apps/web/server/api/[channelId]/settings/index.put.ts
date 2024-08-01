import { SSettings, SSettingsUpdate, TSettings, type TSettingsUpdate } from "bellatrix";
import mergeWith from "lodash.mergewith";
import { getUserPerms, checkPerms } from "~/server/utils/perms";
import { indicateSettingsSync } from "~/server/utils/sync";
import type { TPerms } from "~/types/permissions.type";

function alterSettingsForNonAIUser(data: TSettingsUpdate, perms: TPerms[]): TSettingsUpdate {
  if (data.ollamaAI && !checkPerms(["ai", "ai+", "admin"], perms)) {
    return { ...data, ollamaAI: undefined };
  }

  if (
    (data.ollamaAI?.model || data.ollamaAI?.keepHistory) &&
    !checkPerms(["ai+", "admin"], perms)
  ) {
    return {
      ...data,
      ollamaAI: { ...data.ollamaAI, model: undefined, keepHistory: undefined },
    };
  }

  return data;
}

export default defineEventHandler(async (event) => {
  const auth = await requireAuthSession(event);
  const perms = await getUserPerms(auth.data);

  const body = SSettingsUpdate.safeParse(await readBody(event));

  if (!body.success) {
    throw createError({
      statusCode: 401,
    });
  }

  let { data } = body;
  data = alterSettingsForNonAIUser(data, perms);

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

  const merged = mergeWith(parsed.data, data, (oldv: string | number | [], newv: unknown) => {
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

    indicateSettingsSync(channel.id);

    return mergedParsed.data;
  } catch (_) {
    throw createError({
      statusCode: 500,
    });
  }
});
