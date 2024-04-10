import type { WebuiUser } from "@prisma/client";
import merge from "lodash.merge";
import { prisma } from "services/db";
import { DEFAULT_SETTINGS } from "./constants/settings";
import { SSettings, type TSettings } from "bellatrix";
import { logger } from "utils/logger";

const getDefaults = () => {
  const res = SSettings.safeParse(DEFAULT_SETTINGS);
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

    const parsed = SSettings.safeParse(user.settings);
    if (!parsed.success) {
      logger.warning(`[${user.username}] Failed to parse settings for user`);

      const merged = merge(user.settings, defaults);
      logger.info(`[${user.username}] Trying to merge user.settings with defaults for user`);
      const parsedMerged = SSettings.safeParse(merged);
      if (!parsedMerged.success) {
        logger.error(
          `[${user.username}] Failed to parse merged settings for user. Restoring default settings`,
        );

        await prisma.webuiUser.update({
          where: { id },
          data: { settings: defaults },
        });

        return defaults;
      }

      logger.info(`[${user.username}] Settings merged with defaults and fixed for user`);
      await prisma.webuiUser.update({
        where: { id },
        data: { settings: merged },
      });

      return parsedMerged.data;
    }

    return parsed.data;
  } catch (err) {
    return defaults;
  }
}
