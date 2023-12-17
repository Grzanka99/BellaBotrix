import { getChatHandler } from "handlers";
import { getOAuthToken } from "services/twitch-api/api-connector";
import { chatters } from "./chatters";
import { TwitchApi } from "services/twitch-api";
import { prisma } from "services/db";
import { logger } from "utils/logger";
import { createIrcClient } from "services/twitch-irc/IrcClient";
import { TwitchIrc } from "services/twitch-irc";
import { setDefaultCommandsForChannel } from "services/commands";

export async function startBot(): Promise<void> {
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
  const channels = await prisma.channel.findMany({ where: { enabled: true } });
  if (!channels.length) {
    logger.error("Could not find any enabled channel, quitting");
    return;
  }

  logger.info(`Creating Twitch IRC client for ${channels.length} channel`);

  const ircClient = await createIrcClient(
    "ws://irc-ws.chat.twitch.tv:80",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  );

  if (!ircClient) {
    return;
  }

  const twitchIrcClient = await Promise.all(
    channels.map(async (ch) => {
      const user = await prisma.webuiUser.findFirst({
        where: { channelId: ch.id },
      });

      if (!user) {
        return;
      }

      return new Promise<TwitchIrc>((res) => {
        const twitchClientForChannel = new TwitchIrc(
          ircClient,
          `#${ch.name}`,
          user.id,
          async ({ channel }) => {
            if (apis[channel]) {
              return;
            }

            logger.info(`Creting Twitch API connector for channel: ${channel}`);
            const api = await chatters(channel, mainOAuthToken);

            if (api) {
              apis[channel] = api;
              res(twitchClientForChannel);
            }
          },
        );
      });
    }),
  );

  for (const client of twitchIrcClient.filter(Boolean)) {
    await setDefaultCommandsForChannel(client.channel);

    client.onMessage(async ({ channel, tags, message, self }, it) => {
      if (self) {
        return;
      }

      const handler = await getChatHandler({
        channel,
        tags,
        message,
        settings: it.settings,
        api: apis[channel],
      });

      for (const h of handler) {
        await h.useHandler({
          channel,
          tags,
          message,
          client,
          settings: it.settings,
        });
      }
    });
  }

  console.timeEnd("bootstrap");
}

startBot();

// NOTE: Keep Alive xD
setInterval(() => {}, 100000);
