import { getOAuthToken } from "services/twitch-api/api-connector";
import { prisma } from "services/db";
import { logger } from "utils/logger";
import { createIrcClient } from "services/twitch-irc/IrcClient";
import { ChannelConnection } from "./channel-connection";
import { Channel } from "@prisma/client";

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

  const ircClient = await createIrcClient(
    "ws://irc-ws.chat.twitch.tv:80",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  );

  if (!ircClient) {
    return;
  }

  async function updateConnection(ch: Channel) {
    const user = await prisma.webuiUser.findFirst({ where: { channelId: ch.id } });
    if (!user || !!connections[ch.name] || !ircClient || !mainOAuthToken) {
      return;
    }

    connections[ch.name] = new ChannelConnection({
      ircClient,
      channelName: `#${ch.name}`,
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

    // TODO: Disable connections, not only add new
    // for (const con of Object.keys(connections)) {
    //   if (mappedIds.includes(con)) {
    //     continue;
    //   }
    //
    //   logger.info(`Disabling connection for channel: ${con}`);
    //   delete connections[con];
    // }
  }, 30000);

  console.timeEnd("bootstrap");
}

startBot();

// NOTE: Keep Alive xD
setInterval(() => {}, 100_000);
