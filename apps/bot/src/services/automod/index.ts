import type { TAutomodSettings } from "bellatrix";
import { TwitchApi } from "services/twitch-api";
import type { TTwitchIrcContext } from "services/types";
import { AntispamAI } from "./antispam";
import { StreamStatsGatherer } from "services/streamstats";
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
  private static _instances: Map<string, AutomodService> = new Map();

  private antispam = AntispamAI.instance;

  private api: TwitchApi;
  private stats: StreamStatsGatherer;

  private constructor(private channel: string) {
    this.api = TwitchApi.getInstance(channel);
    this.stats = StreamStatsGatherer.getInstance(channel);
  }

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

      prismaQueue.enqueue(async () => {
        const res = await prisma.automodEvents.create({
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
    } catch (_) {}
  }

  public static getInstance(ch: string): AutomodService {
    const instance = AutomodService._instances.get(ch);

    if (instance) {
      return instance;
    }

    logger.info(`[automod] Setting automode instance for channel: ${ch}`);
    const newInstance = new AutomodService(ch);

    AutomodService._instances.set(ch, newInstance);
    return newInstance;
  }

  public async handle(settings: TAutomodSettings, ctx: TTwitchIrcContext) {
    if (!ctx.message) {
      return;
    }

    if (settings.firstMessageFilter.enabled.value && ctx.tags?.firstMessage) {
      this.antispam.isMessageSpam(ctx.message).then((res) => {
        const userId = ctx.tags?.userId;
        if (res && userId) {
          this.api.banUserById(userId, "spam or scam").then(() => {
            this.log(EAutomodActions.Ban, userId, EAutomodHandlers.Antispam);
          });
        }
      });
    }
  }
}
