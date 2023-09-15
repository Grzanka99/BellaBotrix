import { getChatHandler } from "handlers";
import { getOAuthToken } from "services/twitch-api/api-connector";
import tmi from "tmi.js";
import { chatters } from "./chatters";
import { TwitchApi } from "services/twitch-api";
import { prisma } from "services/db";
import { logger } from "@cgsh/utils";

export async function bootstrap(): Promise<void> {
  const apis: Record<string, TwitchApi> = {};

  logger.info("Bootstrap");

  logger.info("Obtaining main OAuth token");
  const mainOAuthToken = await getOAuthToken();
  if (!mainOAuthToken) {
    logger.error("Error obtaining main OAuth token, quitting");
    return;
  }
  logger.info("Main OAuth token obtained");

  logger.info("Getting enabled channels from DB");
  const channels = (await prisma.channel.findMany()).filter((ch) => ch.enabled);
  const channelsNames = channels.map((ch) => ch.name);
  if (!channels.length) {
    logger.error("Could not find any enabled channel, quitting");
    return;
  }

  logger.info(`Creating Twitch IRC client for ${channelsNames.length} channel`);
  const ircClient = new tmi.Client({
    options: { debug: true },
    identity: {
      username: Bun.env.CLIENT_ID,
      password: Bun.env.PASSWORD,
    },
    channels: channelsNames,
  });

  logger.info("Starting connection to Twitch IRC");
  ircClient.connect();

  ircClient.on("join", async (channel) => {
    if (!channelsNames.includes(channel) || !!apis[channel]) {
      return;
    }

    logger.info(`Creating Twitch API connector for channel: ${channel}`)
    const api = await chatters(channel, mainOAuthToken);
    if (api) {
      apis[channel] = api;
    }
  });

  ircClient.on("message", async (channel, tags, message, self) => {
    if (self) {
      return;
    }

    const handler = await getChatHandler(channel, tags, message, apis[channel]);

    handler.forEach(async (handler) => {
      await handler.useHandler({
        channel,
        tags,
        message,
        client: ircClient,
      });
    });
  });
}
