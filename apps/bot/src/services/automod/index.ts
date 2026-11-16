import type { TAutomodSettings } from "bellatrix";
import type { TwitchApi } from "services/twitch-api";
import type { TTwitchIrcContext } from "services/types";
import { AntispamAI } from "./antispam";
import type { StreamStatsGatherer } from "services/streamstats";
import { prisma, prismaQueue } from "services/db";
import { logger } from "utils/logger";

enum EAutomodActions {
  Ban = "BAN",
  Timeout = "TIMEOUT",
}

enum EAutomodHandlers {
  Antispam = "ANTISPAM",
}

export class AutomodService {
  private antispam = AntispamAI.instance;

  constructor(
    private channel: string,
    private api: TwitchApi,
    private stats: StreamStatsGatherer,
  ) {}

  private log(
    action: EAutomodActions,
    userid: string,
    handler: EAutomodHandlers,
    additional?: {
      message?: string;
      duration?: number;
    },
  ) {
    try {
      const timestamp = String(Date.now());
      logger.info(
        `[AUTOMOD] [${handler}] [${action}] target: ${userid} ${JSON.stringify(additional)}`,
      );

      void prismaQueue.enqueue(async () => {
        await prisma.automodEvents.create({
          data: {
            timestamp,
            action,
            handler,
            channel: this.channel,
            streamId: this.stats.activeStreamId,
            target: userid,
            message: additional?.message || undefined,
            duration: additional?.duration || undefined,
          },
        });
      });
    } catch {}
  }

  public async handle(settings: TAutomodSettings, ctx: TTwitchIrcContext) {
    if (!ctx.message) {
      return;
    }

    if (settings.firstMessageFilter.enabled.value && ctx.tags?.firstMessage) {
      void this.antispam.isMessageSpam(ctx.message).then((res) => {
        const userId = ctx.tags?.userId;
        if (res && userId) {
          void this.api.banUserById(userId, "spam or scam").then(() => {
            this.log(EAutomodActions.Ban, userId, EAutomodHandlers.Antispam, {
              message: ctx.message,
            });
          });
        }
      });
    }
  }
}
