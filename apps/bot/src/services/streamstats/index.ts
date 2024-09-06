import { prisma, prismaQueue, storage } from "services/db";
import { TwitchApi } from "services/twitch-api";
import type { TTwitchApiChatter, TTwitchIrcContext } from "services/types";
import { logger } from "utils/logger";

const STANDBY_TIMEOUT = 60_000;

export class StreamStatsGatherer {
  public static instances = new Map<string, StreamStatsGatherer>();

  private api: TwitchApi;

  private activeStream: string | undefined = undefined;
  private activeStreamId = -1;

  constructor(private channel: string) {
    this.api = TwitchApi.getInstance(channel);
  }

  public static getInstance(ch: string): StreamStatsGatherer {
    const instance = StreamStatsGatherer.instances.get(ch);

    if (instance) {
      return instance;
    }

    const newInstance = new StreamStatsGatherer(ch);

    StreamStatsGatherer.instances.set(ch, newInstance);
    return newInstance;
  }

  private statsInterval: Timer | undefined = undefined;
  private standbyInterval: Timer | undefined = undefined;

  private async startGathering(startedAt: string, streamerId: string, interval = 30_000) {
    logger.info(`${this.channel} is now live, starting gathering stats`);
    storage.set(`${this.channel}_is_live`, true);

    storage.set(this.messagesKey, 0);
    storage.set(this.newChattersKey, 0);
    this.activeStream = `${startedAt}@${this.channel}`;

    const res = await prisma.streams.upsert({
      where: { unique_id: this.activeStream },
      create: {
        started_at: startedAt,
        channel: this.channel,
        unique_id: this.activeStream,
        streamer_id: streamerId,
      },
      update: { started_at: startedAt },
    });

    this.activeStreamId = res.id;

    this.statsInterval = setInterval(() => {
      this.handleGathering();
    }, interval);
  }

  public async startStandby() {
    logger.info(`${this.channel} is now offline, standby mode`);
    storage.set(`${this.channel}_is_live`, false);
    clearInterval(this.statsInterval);

    this.standbyInterval = setInterval(async () => {
      await this.handleStandby();
    }, STANDBY_TIMEOUT);

    if (!this.activeStream) {
      return;
    }

    const uniqueChatters = storage.get<string[]>(this.uniqueChattersKey);
    storage.delete(this.uniqueChattersKey);

    await prisma.streams.update({
      where: { unique_id: this.activeStream },
      data: {
        finished_at: String(Date.now()),
        uniqueChatters: uniqueChatters?.value.length,
      },
    });
  }

  private get messagesKey() {
    return `${this.channel}_stats_messages_in_that`;
  }

  private get newChattersKey() {
    return `${this.channel}_stats_new_chatters`;
  }

  public reportMessage(ctx: TTwitchIrcContext) {
    let messages = storage.get<number>(this.messagesKey)?.value || 0;
    let newChatters = storage.get<number>(this.newChattersKey)?.value || 0;

    messages = messages + 1;
    storage.set(this.messagesKey, messages);

    if (ctx.tags?.firstMessage) {
      newChatters = newChatters + 1;
      storage.set(this.newChattersKey, this.newChattersKey);
    }
  }

  private get uniqueChattersKey() {
    return `${this.channel}_unique_chatters`;
  }

  private handleUniqueChatters(chatters: TTwitchApiChatter[]) {
    const current = storage.get<Array<string>>(this.uniqueChattersKey);
    const asSet = new Set(current?.value || undefined);

    for (const chatter of chatters) {
      asSet.add(chatter.user_id);
    }

    storage.set(this.uniqueChattersKey, Array.from(asSet));
  }

  private async handleGathering() {
    const info = await this.api.getStreamInfo();

    if (!info) {
      storage.set(this.messagesKey, 0);
      storage.set(this.newChattersKey, 0);
      this.startStandby();
      return;
    }

    if (!this.activeStream) {
      this.activeStream = `${info.started_at}@${this.channel}`;
    }

    const tmpmsg = storage.get<number>(this.messagesKey)?.value || 0;
    const tmpnewcht = storage.get<number>(this.newChattersKey)?.value || 0;
    storage.set(this.messagesKey, 0);
    storage.set(this.newChattersKey, 0);

    this.handleUniqueChatters(this.api.chatters);

    await prismaQueue.enqueue(() =>
      prisma.streamStats.create({
        data: {
          streamId: this.activeStreamId,
          viewers: info.viewer_count,
          timestamp: String(Date.now()),
          messages: tmpmsg,
          newChatters: tmpnewcht,
        },
      }),
    );
  }

  private async handleStandby() {
    const info = await this.api.getStreamInfo();

    if (!info) {
      return;
    }

    this.startGathering(info.started_at, info.user_id);
    clearInterval(this.standbyInterval);
  }

  public async init() {
    const info = await this.api.getStreamInfo();
    if (!info) {
      this.startStandby();
    } else {
      this.startGathering(info.started_at, info.user_id);
    }
  }

  public destroy() {
    clearInterval(this.statsInterval);
    clearInterval(this.standbyInterval);
    StreamStatsGatherer.instances.delete(this.channel);
  }
}
