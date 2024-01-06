import { TOption } from "types";
import { logger } from "utils/logger";

export async function createIrcClient(
  url: string,
  nick: string,
  password: string,
): Promise<TOption<WebSocket>> {
  return new Promise((res, rej) => {
    try {
      const client = new WebSocket(url);
      client.addEventListener("open", () => {
        client.send("CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands");
        client.send(`PASS ${password}`);
        client.send(`NICK ${nick}`);

        res(client);
      });

      client.addEventListener("message", (res) => {
        if (!res.data || typeof res.data !== "string") {
          return;
        }

        if (res.data.startsWith("PING :")) {
          logger.info(`Received ping: ${res.data.substring("PING: ".length)}`);
          const pong = `PONG: ${res.data.substring("PING: ".length).trim()}`;
          logger.info(`Sending pong: ${pong}`);
          client.send(pong);
        }
      });
    } catch (err) {
      logger.error("Couldn't establish connection");
      rej(false);
    }
  });
}
