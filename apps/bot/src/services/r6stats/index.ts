import type { TOption } from "bellatrix";
import { logger } from "utils/logger";
import { SR6StatsResult, type TR6ProfileStats } from "./schema";

const R6_API_URL = Bun.env.R6_API_URL;
const R6_API_STATUS_ENDPOINT = Bun.env.R6_API_STATUS_ENDPOINT;

enum ER6Platform {
  PC = "pc",
  Console = "console",
}

export class R6Stats {
  static #instance: R6Stats | undefined;
  private isSetup = false;

  private get logger() {
    return {
      info: (msg: string) => logger.info(`[R6Stats] ${msg}`),
      warning: (msg: string) => logger.warning(`[R6Stats] ${msg}`),
      error: (msg: string) => logger.error(`[R6Stats] ${msg}`),
    };
  }

  public static get instance(): R6Stats {
    if (!R6Stats.#instance) {
      logger.info("Setting up R6Stats instance");
      R6Stats.#instance = new R6Stats();
    }

    return R6Stats.#instance;
  }

  public async setup(): Promise<boolean> {
    if (this.isSetup) {
      return true;
    }

    this.logger.info("Setting up tracker API");

    if (!R6_API_URL || !R6_API_STATUS_ENDPOINT) {
      return false;
    }

    try {
      const res = await fetch(R6_API_STATUS_ENDPOINT);
      const status = (await res.json()) as { message: string };

      if (status.message === "ok") {
        logger.info("Tracker API setup successfully");
        this.isSetup = true;
        return true;
      }

      return false;
    } catch (_) {
      this.logger.info("Something went wrong while setting up tracker API");
      return false;
    }
  }

  public async getProfile(
    username: string,
    platform = ER6Platform.PC,
  ): Promise<TOption<TR6ProfileStats>> {
    try {
      const res = await fetch(`${R6_API_URL}/r6/profiles/${platform}/${username}`);
      const asJson = await res.json();

      const stats = SR6StatsResult.safeParse(asJson);

      if (!stats.success) {
        this.logger.error(`Something went wrong while wetching data for profile ${username}`);
        return undefined;
      }

      if (stats.data.code !== 200) {
        this.logger.error(`API server error: ${stats.data.code}`);
      }

      const profilesIds: string[] = Object.keys(stats.data.profiles);

      if (profilesIds.length !== 1) {
        this.logger.error(`Wrong number of profiles: ${profilesIds.length}`);
      }

      return stats.data.profiles[profilesIds[0]];
    } catch (_) {
      this.logger.error(`Something went wrong while wetching data for profile ${username}`);
      return undefined;
    }
  }
}
