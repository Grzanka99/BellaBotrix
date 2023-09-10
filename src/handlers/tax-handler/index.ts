import { THandlerArgs, TTaxValues, TUseHandler } from "handlers/types";
import { prepareTaxMessages } from "./tax-user";
import { delay } from "utils/delay";

export function createTaxHandler(msg: TTaxValues): TUseHandler {
  const messages = prepareTaxMessages(msg);

  return async function ({ channel, client }: THandlerArgs) {
    await client.say(channel, messages[0]);
    await delay(2000);
    await client.say(channel, messages[1]);
  };
}
