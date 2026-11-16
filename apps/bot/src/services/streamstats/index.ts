import type { TBotEventOf } from "bus/events";
import { prisma, prismaQueue, storage } from "services/db";
import type { TwitchApi } from "services/twitch-api";
import type { TTwitchApiChatter, TTwitchIrcContext } from "services/types";
import { every } from "utils/every";
import { logger } from "utils/logger";

export class StreamStatsGatherer {
  private activeStream: string | undefined = undefined;
  private _activeStreamId = -1;

  public get activeStreamId(): number {
    return this._activeStreamId;
  }

  constructor(
    private channel: string,
    private api: TwitchApi,
  ) {}

  // NOTE: called on stream.started, sampling stops when signal (the live stream scope) is aborted
  public async start(
    event: TBotEventOf<"stream.started">,
    signal: AbortSignal,
    interval = 30_000,
  ): Promise<void> {
    logger.info(`${this.channel} starting gathering stats`);

    storage.set(this.messagesKey, 0);
    storage.set(this.newChattersKey, 0);
    this.activeStream = `${event.startedAt}@${this.channel}`;

    const res = await prisma.streams.upsert({
      where: { unique_id: this.activeStream },
      create: {
        started_at: event.startedAt,
        channel: this.channel,
        unique_id: this.activeStream,
        streamer_id: event.streamerId,
      },
      update: { started_at: event.startedAt },
    });

    this._activeStreamId = res.id;

    every(interval, () => void this.handleGathering(), signal);
  }

  // NOTE: called on stream.ended
  public async finish(): Promise<void> {
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

    messages = messages + 1;
    storage.set(this.messagesKey, messages);

    if (ctx.tags?.firstMessage) {
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

    // NOTE: StreamWatcher publishes stream.ended when the stream is really gone
    if (!info) {
      return;
    }

    const tmpmsg = storage.get<number>(this.messagesKey)?.value || 0;
    const tmpnewcht = storage.get<number>(this.newChattersKey)?.value || 0;
    storage.set(this.messagesKey, 0);
    storage.set(this.newChattersKey, 0);

    this.handleUniqueChatters(this.api.chatters);

    await prismaQueue.enqueue(() =>
      prisma.streamStats.create({
        data: {
          streamId: this._activeStreamId,
          viewers: info.viewer_count,
          timestamp: String(Date.now()),
          messages: tmpmsg,
          newChatters: tmpnewcht,
        },
      }),
    );
  }
}
