import { WebuiUser } from "@prisma/client";
import { prisma } from "services/db";
import { DEFAULT_SETTINGS } from "./constants/settings";
import { TOption } from "types";
import { SettingSchema, TSettings } from "types/schema/settings.schema";

const getDefaults = () => {
  const res = SettingSchema.safeParse(DEFAULT_SETTINGS);
  if (!res.success) {
    throw "Critical error, DEFAULT_SETTINGS is incorrect";
  }

  return res.data;
};

export async function getSettings(unameorid: number | string): Promise<TSettings> {
  const defaults = getDefaults();
  try {
    let user: WebuiUser | null = null;
    if (typeof unameorid === "number") {
      user = await prisma.webuiUser.findUnique({ where: { id: unameorid } });
    } else {
      user = await prisma.webuiUser.findUnique({ where: { username: unameorid } });
    }

    if (!user) {
      return defaults;
    }

    const id = user.id;

    if (user.settings === "") {
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: JSON.stringify(defaults) },
      });

      return defaults;
    }

    const jsObj = JSON.parse(user.settings);

    if (!jsObj) {
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: JSON.stringify(defaults) },
      });

      return defaults;
    }

    const parsed = SettingSchema.safeParse(jsObj);
    if (!parsed.success) {
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: JSON.stringify(defaults) },
      });

      return defaults;
    }

    return parsed.data;
  } catch (err) {
    return defaults;
  }
}

// NOTE: At this point, we assume that "data" was verified
export async function updateSettings(
  id: number | string,
  data: TSettings,
): Promise<TOption<TSettings>> {
  try {
    let res: WebuiUser | null = null;

    if (typeof id === "number") {
      res = await prisma.webuiUser.update({
        where: { id },
        data: { settings: JSON.stringify(data) },
      });
    } else {
      res = await prisma.webuiUser.update({
        where: { username: id },
        data: { settings: JSON.stringify(data) },
      });
    }

    if (!res) {
      return undefined;
    }

    const parsed = SettingSchema.safeParse(JSON.parse(res.settings));

    if (!parsed.success) {
      return undefined;
    }

    return parsed.data;
  } catch (err) {
    return undefined;
  }
}

export async function resetSettingsToDefaults(id: number): Promise<TOption<TSettings>> {
  try {
    const defaults = getDefaults();

    const res = await prisma.webuiUser.update({
      where: { id },
      data: { settings: JSON.stringify(defaults) },
    });

    const parsed = SettingSchema.safeParse(JSON.parse(res.settings));

    if (!parsed.success) {
      return undefined;
    }

    return parsed.data;
  } catch (err) {
    return undefined;
  }
}
