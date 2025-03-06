import { GoogleGenerativeAI } from "@google/generative-ai";
import type { TOption } from "bellatrix";
import { type Message, Ollama } from "ollama";
import { AsyncQueue } from "utils/async-queue";

const OLLAMA_API_URL = Bun.env.OLLAMA_API_URL;
const AI_AUTOMOD_MODEL = "llama3.2:3b";

const GEMINI_API_KEY = Bun.env.GEMINI_API_KEY as string;

export class AutomodAIGemini {
  private static gemini: GoogleGenerativeAI;
  private static queue: AsyncQueue;

  static #instance: AutomodAIGemini;

  private constructor() {
    if (!AutomodAIGemini.gemini) {
      AutomodAIGemini.gemini = new GoogleGenerativeAI(GEMINI_API_KEY);
    }

    if (!AutomodAIGemini.gemini) {
      AutomodAIGemini.queue = new AsyncQueue();
    }
  }

  public static get instance(): AutomodAIGemini {
    if (AutomodAIGemini.#instance) {
      return AutomodAIGemini.#instance;
    }

    AutomodAIGemini.#instance = new AutomodAIGemini();
    return AutomodAIGemini.#instance;
  }

  public async ask(q: string, system: string[]): Promise<TOption<string>> {
    const model = AutomodAIGemini.gemini.getGenerativeModel({ model: "gemini-2.0-flash" });

    const systemInstruction = {
      parts: system.map((el) => ({ text: el })),
      role: "system",
    };

    const chatSEssion = model.startChat({
      systemInstruction,
      generationConfig: {
        responseMimeType: "text/plain",
      },
    });

    try {
      const res = await chatSEssion.sendMessage(q);

      return res.response.text().trim();
    } catch (_) {
      return undefined;
    }
  }
}

export class AutomodAI {
  private static ollama: Ollama | undefined;
  private static queue: AsyncQueue;

  static #instance: AutomodAI;

  private constructor() {
    if (!AutomodAI.ollama) {
      AutomodAI.ollama = new Ollama({ host: OLLAMA_API_URL });
    }

    if (!AutomodAI.queue) {
      AutomodAI.queue = new AsyncQueue();
    }
  }

  public static get instance(): AutomodAI {
    if (AutomodAI.#instance) {
      return AutomodAI.#instance;
    }

    AutomodAI.#instance = new AutomodAI();
    return AutomodAI.#instance;
  }

  public async ask(q: string, system: string[]): Promise<TOption<string>> {
    const messages: Message[] = [
      ...system.map((el) => ({
        role: "system",
        content: el,
      })),
      { role: "user", content: q },
    ];

    try {
      const res = await AutomodAI.queue.enqueue(
        async () =>
          await AutomodAI.ollama?.chat({
            model: AI_AUTOMOD_MODEL,
            messages,
          }),
      );

      if (!res) {
        return undefined;
      }

      const trimmed = res.message.content.trim();

      return trimmed;
    } catch (_) {
      return undefined;
    }
  }
}
