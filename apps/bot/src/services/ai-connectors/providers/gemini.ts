import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TOption } from "bellatrix";
import { AsyncQueue } from "utils/async-queue";
import type { TAIProvider, THistoryItem } from "../types";
import { logger } from "utils/logger";

const GEMINI_API_KEY = Bun.env.GEMINI_API_KEY as string;

export class GeminiAIProvider implements TAIProvider {
  private static gemini: GoogleGenerativeAI;
  private static queue: AsyncQueue;

  private constructor() {
    if (!GeminiAIProvider.gemini) {
      GeminiAIProvider.gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    if (!GeminiAIProvider.queue) {
      GeminiAIProvider.queue = new AsyncQueue();
    }
  }

  private static _instance: GeminiAIProvider;

  public static get instance(): GeminiAIProvider {
    if (!GeminiAIProvider._instance) {
      GeminiAIProvider._instance = new GeminiAIProvider();
      return GeminiAIProvider._instance;
    }

    return GeminiAIProvider._instance;
  }

  public async send(
    text: string,
    history: THistoryItem[],
    systemSettings: THistoryItem[],
    modelFromConfig: string,
  ): Promise<TOption<string>> {
    const model = GeminiAIProvider.gemini.getGenerativeModel({ model: modelFromConfig });

    const refinedHistory = history.map((el) => {
      if (el.role === "user") {
        return {
          role: "user",
          parts: [{ text: el.content }],
        };
      }

      // NOTE: It's not correct, but it's fine xD
      return {
        role: "model",
        parts: [{ text: el.content }],
      };
    });

    // NOTE: history cannot contain only model message
    refinedHistory.unshift({
      role: "user",
      parts: [{ text: "" }],
    });

    const chatSession = model.startChat({
      systemInstruction: {
        parts: systemSettings.map((el) => ({ text: el.content })),
        role: "system",
      },
      generationConfig: {
        responseMimeType: "text/plain",
      },
      history: refinedHistory,
    });

    try {
      const res = await chatSession.sendMessage(text);

      return res.response.text().trim();
    } catch (_) {
      logger.error("[GEMINI_AI_PROVIDER] Error occured while calling");
      return undefined;
    }
  }
}
