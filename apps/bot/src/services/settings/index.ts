import { WebuiUser } from "@prisma/client";
import { prisma } from "services/db";
import { DEFAULT_SETTINGS } from "./constants/settings";
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
        data: { settings: defaults },
      });

      return defaults;
    }

    if (!user.settings) {
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: defaults },
      });

      return defaults;
    }

    const parsed = SettingSchema.safeParse(user.settings);
    if (!parsed.success) {
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: defaults },
      });

      return defaults;
    }

    return parsed.data;
  } catch (err) {
    return defaults;
  }
}
