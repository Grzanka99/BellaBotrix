import { prisma } from "services/db";
import type { TTwitchApiChatter, TTwitchApiStream } from "services/types";
import {
  banUser,
  getChannelFollowers,
  getChatters,
  getModerators,
  getNewToken,
  getStreams,
  getTwitchApiUser,
  unbanUser,
} from "twitch-api-connector";
import type { TOption } from "types";
import { logger } from "utils/logger";

export class TwitchApi {
  private readonly channelName: string;
  private channelToken: string | undefined = undefined;
  private userId: string | undefined = undefined;
  private moderators: TTwitchApiChatter[] = [];

  public static globalToken: string;

  private constructor(channel: string) {
    logger.info("Creating new api connector");
    this.channelName = channel.replace("#", "");
  }

  private static instances = new Map<string, TwitchApi>();

  public static getInstance(ch: string): TwitchApi {
    const instance = TwitchApi.instances.get(ch);

    if (instance) {
      return instance;
    }

    const newInstance = new TwitchApi(ch);
    TwitchApi.instances.set(ch, newInstance);

    return newInstance;
  }

  public async init(): Promise<void> {
    this.userId = await this.setUserId();

    try {
      await this.getNewToken();
      logger.info(`Access token for channel ${this.channelName} obtained`);
    } catch {
      logger.error(`Failed to optain access token for channel ${this.channelName}`);
    }
  }

  private async setUserId(): Promise<string> {
    const res = await getTwitchApiUser(this.channelName, TwitchApi.globalToken);

    if (!res.success) {
      logger.error(`Failed to get userId of user ${this.channelName}`);
      throw new Error("Could not obtain channel userid");
    }

    return res.data.data[0].id;
  }

  private async getNewToken() {
    logger.info("Obtaining new access token");
    const res = await prisma.channel.findUnique({
      where: { name: this.channelName },
    });

    if (!res) {
      logger.error("Error getting channler from database");
      throw new Error("Could not obtain channele from datanase");
    }

    const newTokens = await getNewToken(res?.token);

    if (!newTokens.success) {
      logger.error("Error getting token from api");
      throw new Error("Could not obtain token from api");
    }

    this.channelToken = newTokens.data.access_token;
    await prisma.channel.update({
      where: { name: this.channelName },
      data: { token: newTokens.data.refresh_token },
    });
  }

  public async forceGetAllFollowers(): Promise<unknown> {
    if (!this.userId || !this.channelToken) {
      return false;
    }

    const firstBatch = await getChannelFollowers(this.userId, this.channelToken);
    if (!firstBatch.success) {
      return [];
    }

    if (firstBatch.total <= firstBatch.data.length) {
      return firstBatch.data;
    }

    let all = firstBatch.data;
    let pagination = firstBatch.pagination.cursor;

    for (;;) {
      const newBatch = await getChannelFollowers(this.userId, this.channelToken, pagination);
      if (!newBatch) {
        break;
      }

      pagination = newBatch.pagination.cursor;
      all = [...all, ...newBatch.data];
      if (newBatch.total <= all.length) {
        break;
      }
    }

    return all;
  }

  public async getChannelModerators(): Promise<TTwitchApiChatter[]> {
    if (!this.userId || !this.channelToken) {
      logger.info(`Using cash for moderators on channel ${this.channelName}`);
      return this.moderators;
    }

    try {
      logger.info(`Fetching list of moderators on channel ${this.channelName}`);
      const res = await getModerators(this.userId, this.channelToken);

      if (!res.success) {
        return this.moderators;
      }

      this.moderators = res.data;

      return res.data;
    } catch {
      return this.moderators;
    }
  }

  public async getUserId(username: string): Promise<TOption<string>> {
    const res = await getTwitchApiUser(username, TwitchApi.globalToken);

    if (!res.success) {
      return undefined;
    }

    return res.data.data[0].id;
  }

  public async banUserById(user_id: string): Promise<unknown> {
    if (!this.userId || !this.channelToken) {
      return undefined;
    }

    await banUser(this.userId, this.channelToken, user_id);
  }

  public async unbanUserById(user_id: string): Promise<unknown> {
    if (!this.userId || !this.channelToken) {
      return undefined;
    }

    await unbanUser(this.userId, this.channelToken, user_id);
  }

  public async getChannelChattersList(): Promise<TTwitchApiChatter[]> {
    if (!this.userId || !this.channelToken) {
      return [];
    }

    try {
      const res = await getChatters(this.userId, this.channelToken);

      if (!res.success) {
        await this.getNewToken();
        const res = await getChatters(this.userId, this.channelToken);

        if (res.success) {
          return res.data.data;
        }

        return [];
      }

      return res.data.data;
    } catch {
      logger.error(`Failed to get chatters for channel ${this.channelName}`);
      return [];
    }
  }

  private refreshInterval: Timer | undefined = undefined;
  private chattersList: TTwitchApiChatter[] = [];

  public startChattersAutorefresh(timeout: number): boolean {
    logger.info(`Setting timer for channel: ${this.channelName} each ${timeout}ms`);
    this.refreshInterval = setInterval(async () => {
      this.chattersList = await this.getChannelChattersList();
    }, timeout);

    return true;
  }

  public async getStreamInfo(): Promise<TOption<TTwitchApiStream>> {
    if (!this.userId || !this.channelToken) {
      return undefined;
    }
    const res = await getStreams(this.userId, this.channelToken);
    if (!res.success) {
      return undefined;
    }

    return res.data.data[0];
  }

  public stopChattersAutorefresh(): boolean {
    clearInterval(this.refreshInterval);
    return true;
  }

  public get chatters() {
    return this.chattersList;
  }
}
