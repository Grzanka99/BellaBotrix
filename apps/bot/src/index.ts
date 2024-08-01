import type { Channel } from "@prisma/client";
import { gc } from "bun";
import { ChannelConnection } from "services/channel-connection";
import { prisma } from "services/db";
import { getOAuthToken } from "services/twitch-api/api-connector";
import { TwitchIrc } from "services/twitch-irc";
import { logger } from "utils/logger";

export async function startBot(): Promise<void> {
  console.time("bootstrap");
  const connections: Record<string, ChannelConnection> = {};

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

  logger.info(`Creating Twitch IRC client for ${channels.length} channel`);

  const ircClient = await new TwitchIrc(
    "ws://irc-ws.chat.twitch.tv:80",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  ).connect();

  if (!ircClient) {
    return;
  }

  async function updateConnection(ch: Channel): Promise<void> {
    const user = await prisma.webuiUser.findFirst({ where: { channelId: ch.id } });
    if (!user || !!connections[ch.name] || !ircClient || !mainOAuthToken) {
      return;
    }

    connections[ch.name] = new ChannelConnection({
      ircClient,
      // NOTE: this weird is thing is done, to make sure that version with one # is passed
      channelName: `#${ch.name.replaceAll("#", "")}`,
      ownerId: user.id,
      authToken: mainOAuthToken,
    });

    await connections[ch.name].setup();
  }

  logger.info(`Setting up initial connections: ${channels.length}`);
  for (const ch of channels) {
    await updateConnection(ch);
  }

  logger.info("Setting interval to refresh channels list");
  setInterval(async () => {
    const res = await prisma.channel.findMany({ where: { enabled: true } });

    for (const ch of res) {
      await updateConnection(ch);
    }

    const mappedIds = res.map((el) => el.name);
    for (const con of Object.keys(connections)) {
      if (mappedIds.includes(con)) {
        continue;
      }

      logger.info(`Disabling connection for channel: ${con}`);
      await connections[con].setdown();
      // @ts-ignore-next-line
      connections[con] = undefined;
      delete connections[con];
      gc(true);
    }
  }, 30_000);

  console.timeEnd("bootstrap");
}

startBot();

// NOTE: Keep Alive xD
setInterval(() => {}, 100_000);
