import { getChatHandler } from "handlers";
import { getOAuthToken } from "services/twitch-api/api-connector";
import { chatters } from "./chatters";
import { TwitchApi } from "services/twitch-api";
import { prisma } from "services/db";
import { logger } from "utils/logger";
import { createIrcClient } from "services/twitch-irc/IrcClient";
import { TwitchIrc } from "services/twitch-irc";

export async function bootstrap(): Promise<void> {
  console.time("bootstrap");
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

  const ircClient = await createIrcClient(
    "ws://irc-ws.chat.twitch.tv:80",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  );

  if (!ircClient) {
    return;
  }

  const twitchIrcClient = await Promise.all(
    channelsNames.map(
      (ch) =>
        new Promise<TwitchIrc>((res) => {
          const twitchClientForChannel = new TwitchIrc(ircClient, `#${ch}`, async ({ channel }) => {
            if (apis[channel]) {
              return;
            }

            logger.info(`Creting Twitch API connector for channel: ${channel}`);
            const api = await chatters(channel, mainOAuthToken);

            if (api) {
              apis[channel] = api;
              res(twitchClientForChannel);
            }
          });
        }),
    ),
  );

  twitchIrcClient.forEach((client) => {
    client.onMessage(async ({ channel, tags, message, self }, it) => {
      if (self) {
        return;
      }

      const handler = await getChatHandler(channel, tags, message, apis[channel]);

      handler.forEach(async (handler) => {
        await handler.useHandler({
          channel,
          tags,
          message,
          client,
        });
      });
    });
  });

  console.timeEnd("bootstrap");
}
