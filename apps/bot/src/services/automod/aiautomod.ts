import type { TOption } from "bellatrix";
import { type Message, Ollama } from "ollama";
import { AsyncQueue } from "utils/async-queue";

const OLLAMA_API_URL = Bun.env.OLLAMA_API_URL;
// const OLLAMA_API_URL = "http://localhost:11434";
const AI_AUTOMOD_MODEL = "llama3.2:3b";

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
