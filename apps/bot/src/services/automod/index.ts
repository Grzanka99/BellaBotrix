import type { TAutomodSettings } from "bellatrix";
import { TwitchApi } from "services/twitch-api";
import type { TTwitchIrcContext } from "services/types";
import { AntispamAI } from "./antispam";

export class AutomodService {
  private static _instances: Map<string, AutomodService> = new Map();
  private antispam = AntispamAI.instance;

  private api: TwitchApi;

  private constructor(private channel: string) {
    this.api = TwitchApi.getInstance(channel);
  }

  public static getInstance(ch: string): AutomodService {
    const instance = AutomodService._instances.get(ch);

    if (instance) {
      return instance;
    }

    const newInstance = new AutomodService(ch);

    AutomodService._instances.set(ch, newInstance);
    return newInstance;
  }

  public async handle(
    settings: TAutomodSettings,
    ctx: TTwitchIrcContext,
    send: (msg: string) => void,
  ) {
    if (!ctx.message) {
      return;
    }

    if (settings.firstMessageFilter.enabled.value && ctx.tags?.firstMessage) {
      this.antispam.isMessageSpam(ctx.message).then((res) => {
        if (res && ctx.tags?.userId) {
          this.api.banUserById(ctx.tags.userId);
        }
      });
    }
  }
}
