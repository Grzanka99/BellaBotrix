import { type Message, Ollama } from "ollama";
import type { TAIProvider, THistoryItem } from "../types";
import { AsyncQueue } from "utils/async-queue";
import { logger } from "utils/logger";
import type { TOption } from "bellatrix";

const OLLAMA_API_URL = Bun.env.OLLAMA_API_URL;

export class OllamaAIProvider implements TAIProvider {
  private static ollama: Ollama | undefined;
  private static queue: AsyncQueue;

  private constructor() {
    if (!OllamaAIProvider.ollama) {
      OllamaAIProvider.ollama = new Ollama({ host: OLLAMA_API_URL });
    }

    if (!OllamaAIProvider.queue) {
      OllamaAIProvider.queue = new AsyncQueue();
    }
  }

  private static _instance: OllamaAIProvider;

  public static get instance(): OllamaAIProvider {
    if (!OllamaAIProvider._instance) {
      OllamaAIProvider._instance = new OllamaAIProvider();
      return OllamaAIProvider._instance;
    }

    return OllamaAIProvider._instance;
  }

  public async send(
    text: string,
    history: THistoryItem[],
    systemSettings: THistoryItem[],
    model: string,
  ): Promise<TOption<string>> {
    const message: Message = {
      role: "user",
      content: text,
    };

    const messages: Message[] = [...systemSettings, ...history, message];

    try {
      const res = await OllamaAIProvider.queue.enqueue(
        async () => await OllamaAIProvider.ollama?.chat({ model, messages }),
      );

      if (!res) {
        logger.error("[OLLAMA_AI_PROVIDER] Received empty response");
        return undefined;
      }

      const trimmed = res.message.content.trim();

      return trimmed;
    } catch (_) {
      logger.error("[OLLAMA_AI_PROVIDER] Error occured while calling");
      return undefined;
    }
  }
}
