import { prisma, prismaQueue, storage } from "services/db";
import { TwitchApi } from "services/twitch-api";
import type { TTwitchIrcContext } from "services/types";
import { logger } from "utils/logger";

export class StreamStatsGatherer {
  public static instances = new Map<string, StreamStatsGatherer>();

  private api: TwitchApi;

  private activeStream: string | undefined = undefined;
  private activeStreamId = -1;

  private uniqueChatters = new Set<string>();

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

    this.messages = 0;
    this.newChatters = 0;
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
    }, 60_000);

    if (!this.activeStream) {
      return;
    }

    await prisma.streams.update({
      where: { unique_id: this.activeStream },
      data: {
        finished_at: String(Date.now()),
      },
    });
  }

  private messages = 0;
  private newChatters = 0;

  public reportMessage(ctx: TTwitchIrcContext) {
    this.messages = this.messages + 1;

    if (ctx.tags?.firstMessage) {
      this.newChatters = this.newChatters + 1;
    }
  }

  private async handleGathering() {
    const info = await this.api.getStreamInfo();

    if (!info) {
      this.messages = 0;
      this.newChatters = 0;
      this.startStandby();
      return;
    }

    if (!this.activeStream) {
      this.activeStream = `${info.started_at}@${this.channel}`;
    }

    const tmpmsg = this.messages;
    const tmpnewcht = this.newChatters;
    this.messages = 0;
    this.newChatters = 0;

    for (const chatter of this.api.chatters) {
      this.uniqueChatters.add(chatter.user_id);
    }

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

    console.log(info, "checking for start");

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
