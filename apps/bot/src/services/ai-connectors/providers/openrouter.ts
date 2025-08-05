import { AsyncQueue } from "utils/async-queue";
import type { TAIProvider, THistoryItem } from "../types";
import type { TOption } from "bellatrix";
import { logger } from "utils/logger";

const OPENROUTER_API_KEY = Bun.env.OPENROUTER_API_KEY as string;
const OPENROUTER_URL = Bun.env.OPENROUTER_API_URL as string;

export class OpenrouterAIProvider implements TAIProvider {
  private static queue: AsyncQueue;

  private constructor() {
    if (!OpenrouterAIProvider.queue) {
      OpenrouterAIProvider.queue = new AsyncQueue();
    }
  }

  private static _instance: OpenrouterAIProvider;

  public static get instance(): OpenrouterAIProvider {
    if (!OpenrouterAIProvider._instance) {
      OpenrouterAIProvider._instance = new OpenrouterAIProvider();
      return OpenrouterAIProvider._instance;
    }

    return OpenrouterAIProvider._instance;
  }

  public async send(
    text: string,
    history: THistoryItem[],
    systemSettings: THistoryItem[],
    modelFromConfig: string,
  ): Promise<TOption<string>> {
    if (!OPENROUTER_URL || !OPENROUTER_URL.length) {
      logger.error("[OPENROUTER] missingh openrouter api url");
      return undefined;
    }

    if (!OPENROUTER_API_KEY || !OPENROUTER_API_KEY.length) {
      logger.error("[OPENROUTER] missing openrouter api key");
      return undefined;
    }

    const messages = [...systemSettings, ...history].map((el) => ({
      role: el.role,
      content: [
        {
          type: "text",
          text: el.content,
        },
      ],
    }));

    messages.push({
      role: "user",
      content: [
        {
          type: "text",
          text,
        },
      ],
    });

    try {
      const res = await fetch(`${OPENROUTER_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "X-Title": "BellaBotrix",
        },
        body: JSON.stringify({
          model: modelFromConfig,
          messages,
        }),
      });

      const data = (await res.json()) as any;

      const textres = data.choices[0].message.content;
      return textres;
    } catch (err) {
      logger.error(
        `[OPENROUTER] something went wrong while calling openrouter: ${JSON.stringify(err)}`,
      );
      return undefined;
    }
  }
}
