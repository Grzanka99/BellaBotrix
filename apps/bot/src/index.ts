import { ChatOutbox } from "bus/chat-outbox";
import { bus } from "bus/event-bus";
import { startTicker } from "bus/ticker";
import { ChannelConnection } from "services/channel-connection";
import { ChannelListWatcher } from "services/channel-list-watcher";
import { TwitchApi } from "services/twitch-api";
import { TwitchIrc } from "services/twitch-irc";
import { getOAuthToken } from "twitch-api-connector";
import { logger } from "utils/logger";

export async function startBot(): Promise<void> {
  console.time("bootstrap");
  // NOTE: keyed by the "#name" form, same as event.channel
  const connections: Record<string, ChannelConnection> = {};

  logger.info("Bootstrap");
  startTicker();

  logger.info("Obtaining main OAuth token");
  const oauthTokenRes = await getOAuthToken();
  if (!oauthTokenRes.success) {
    logger.error("Error obtaining main OAuth token, quitting");
    return;
  }

  const mainOAuthToken = oauthTokenRes.data.access_token;

  logger.info("Main OAuth token obtained");

  logger.info("Creating Twitch IRC client");

  const ircClient = TwitchIrc.instance(
    "wss://irc-ws.chat.twitch.tv",
    Bun.env.CLIENT_ID || "",
    Bun.env.PASSWORD || "",
  );

  await ircClient.connect();

  if (!ircClient) {
    return;
  }

  ircClient.startPingCheck();

  const outbox = new ChatOutbox(ircClient);

  TwitchApi.globalToken = mainOAuthToken;

  async function enableChannel(channel: `#${string}`): Promise<void> {
    if (connections[channel]) {
      return;
    }

    const connection = new ChannelConnection({
      ircClient,
      outbox,
      channelName: channel,
      authToken: mainOAuthToken,
    });

    // NOTE: stored before setup, so a disable during a slow setup (bus timeout) sets this one down
    connections[channel] = connection;
    try {
      await connection.setup();
    } catch (e) {
      // NOTE: removed, so the next channel list sync retries it
      logger.error(`[${channel}] setup failed: ${e}`);
      connection.setdown();
      if (connections[channel] === connection) {
        delete connections[channel];
      }
      return;
    }

    // NOTE: disabled while setup was running
    if (connections[channel] !== connection) {
      connection.setdown();
    }
  }

  function disableChannel(channel: string): void {
    const connection = connections[channel];
    if (!connection) {
      return;
    }

    logger.info(`Disabling connection for channel: ${channel}`);
    connection.setdown();
    delete connections[channel];
  }

  // NOTE: a single subscription, so enable and disable of the same channel never run concurrently
  bus.on("channel.changed", async (event) => {
    if (event.enabled) {
      await enableChannel(event.channel as `#${string}`);
    } else {
      disableChannel(event.channel);
    }
  });

  logger.info("Watching enabled channels list");
  new ChannelListWatcher(new AbortController().signal).start();

  console.timeEnd("bootstrap");
}

void startBot().catch((e) => logger.error(`Bootstrap failed: ${e}`));
// NOTE: the ticker's setInterval keeps the process alive
