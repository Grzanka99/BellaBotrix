import { logger } from "@cgsh/utils";
import { prisma } from "services/db";
import {
  getChatters,
  getNewToken,
  getOAuthToken,
  getTwitchApiUser,
} from "./api-connector";
import { TTwitchApiChatter } from "services/types";

export class TwitchApi {
  private channelToken: string | undefined = undefined;
  private globalToken: string;
  private channelName: string;
  private userId: string | undefined = undefined;

  constructor(channel: string, token: string) {
    logger.info("Creating new api connector");
    this.channelName = channel.replace("#", "");
    this.globalToken = token;

    this.setUserId().then((res) => {
      this.userId = res;
    });

    this.getNewToken()
      .then((res) => {
        logger.info(`Access token for channle ${this.channelName} obtained`);
        this.channelToken = res;
      })
      .catch(() => {
        logger.error(
          `Failed to optain access token for channel ${this.channelName}`,
        );
      });
  }

  private async setUserId(): Promise<string> {
    const res = await getTwitchApiUser(this.channelName, this.globalToken);

    if (!res || !res.data.length) {
      logger.error(`Faild to get userId of user ${this.channelName}`);
      throw new Error("Could not obtain channel userid");
    }

    return res.data[0].id;
  }

  private async getNewToken(): Promise<string> {
    logger.info("Obtaining new access token");
    const res = await prisma.channel.findUnique({
      where: { name: this.channelName },
    });

    if (!res) {
      logger.error("Error getting channler from database");
      throw new Error("Could not obtain channele from datanase");
    }

    const newTokens = await getNewToken(res?.token);

    if (!newTokens) {
      logger.error("Error getting token from api");
      throw new Error("Could not obtain token from api");
    }

    prisma.channel.update({
      where: { name: this.channelName },
      data: { token: newTokens.refresh_token },
    });

    return newTokens.access_token;
  }

  public async getChannelChattersList(): Promise<TTwitchApiChatter[]> {
    if (!this.userId || !this.channelToken) {
      return [];
    }

    try {
      const res = await getChatters(this.userId, this.channelToken);

      if (!res) {
        await this.getNewToken();
        const res = await getChatters(this.userId, this.channelToken);

        if (res) {
          return res.data;
        }

        return [];
      }
      return res.data;
    } catch {
      logger.error(`Failed to get chatters for channel ${this.channelName}`);
      return [];
    }
  }

  private refreshInterval: Timer | undefined = undefined;
  private chattersList: TTwitchApiChatter[] = [];

  public startChattersAutorefresh(timeout: 2000): boolean {
    logger.info(`Setting timer for channel: ${this.channelName} each ${timeout}ms`)
    this.refreshInterval = setInterval(async () => {
      const res = await this.getChannelChattersList();
      this.chattersList = res;
    }, timeout);

    return true;
  }

  public stopChattersAutorefresh(): boolean {
    clearInterval(this.refreshInterval);
    return true;
  }

  public get chatters() {
    return this.chattersList;
  }
}
