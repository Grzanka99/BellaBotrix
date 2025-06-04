import type { Channel } from "@prisma/client";
import { gc } from "bun";
import { ChannelConnection } from "services/channel-connection";
import { prisma, storage } from "services/db";
import { TwitchApi } from "services/twitch-api";
import { TwitchIrc } from "services/twitch-irc";
import { CK_CHANNELS_SYNC } from "sqlite-storage";
import { getOAuthToken } from "twitch-api-connector";
import { logger } from "utils/logger";

export async function startBot(): Promise<void> {
  console.time("bootstrap");
  const connections: Record<string, ChannelConnection> = {};

  logger.info("Bootstrap");

  logger.info("Obtaining main OAuth token");
  const oauthTokenRes = await getOAuthToken();
  if (!oauthTokenRes.success) {
    logger.error("Error obtaining main OAuth token, quitting");
    return;
  }

  const mainOAuthToken = oauthTokenRes.data.access_token;

  logger.info("Main OAuth token obtained");

  logger.info("Getting enabled channels from DB");
  const channels = await prisma.channel.findMany({ where: { enabled: true } });

  logger.info(`Creating Twitch IRC client for ${channels.length} channel`);

  const ircClient = TwitchIrc.instance(
    "ws://irc-ws.chat.twitch.tv:80",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  );

  await ircClient.connect();

  if (!ircClient) {
    return;
  }

  ircClient.startPingCheck();

  TwitchApi.globalToken = mainOAuthToken;

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

  let lastUpdateTimestamp: number = Date.now();
  setInterval(async () => {
    if (!storage.has(CK_CHANNELS_SYNC)) {
      storage.set(CK_CHANNELS_SYNC, lastUpdateTimestamp);
    }

    const updateFromStorage = storage.get<number>(CK_CHANNELS_SYNC);

    if (!updateFromStorage) {
      storage.set(CK_CHANNELS_SYNC, lastUpdateTimestamp);
      return;
    }

    if (updateFromStorage.value === lastUpdateTimestamp) {
      return;
    }

    logger.info(
      `Refreshing channel connections: ${lastUpdateTimestamp} -> ${updateFromStorage.value}`,
    );

    lastUpdateTimestamp = updateFromStorage.value;

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
