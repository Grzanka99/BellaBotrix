import type { TOption } from "bellatrix";
import { Ollama, type Message } from "ollama";
import { AsyncQueue } from "utils/async-queue";
import { logger } from "utils/logger";

const OLLAMA_API_URL = Bun.env.OLLAMA_API_URL;
const ALLOWED_MODELS = Bun.env.ALLOWED_MODELS || ["phi3"];

const DEFAULT_PART: Message[] = [
  {
    role: "system",
    content:
      "You are twitch chat user. Keep your replies short, reply cannot exceed 500 characters.",
  },
  {
    role: "system",
    content: "You are watching this stream alongside other users that may mention you on chat",
  },
  {
    role: "system",
    content:
      "Your name is BellaBotrix so everytime you see @BellaBotrix in message it reffers to you. Do not include your name in response",
  },
  {
    role: "system",
    content: "NEVER include @BellaBotrix or BellaBotrix in reply",
  },
];

export class OllamaAI {
  private static ollama: Ollama | undefined;
  private static queue: AsyncQueue;

  private history: Message[] = [];

  constructor() {
    if (!OllamaAI.ollama) {
      OllamaAI.ollama = new Ollama({ host: OLLAMA_API_URL });
    }

    if (!OllamaAI.queue) {
      OllamaAI.queue = new AsyncQueue();
    }
  }

  private historySize = 0;
  public setHistorySize(size: number) {
    // NOTE: x2 to keep every reponse also
    this.historySize = size * 2;
  }

  private languagePrompt: Message = {
    role: "system",
    content: "Always reply in English",
  };
  public setLanguage(lang: string) {
    this.languagePrompt = {
      role: "system",
      content: `Always reply in ${lang}`,
    };
  }

  private defaultPrompt: Message = {
    role: "system",
    content:
      "Be a little toxic, you pretend to be Bellatrix Le'Strange from Harry Potter universum.",
  };
  public setDefaultPrompt(prompt: string) {
    this.defaultPrompt = {
      role: "system",
      content: prompt,
    };
  }

  private model = "phi3";
  public setModel(model: string) {
    this.model = this.getAllowdModel(model);
  }

  private addToHistory(message: Message) {
    if (this.history.length >= this.historySize) {
      this.history.shift();
    }

    this.history.push(message);
  }

  private isCleanerRunning = false;
  public startHistoryCleaner(channel: string) {
    logger.info(`[${channel}] Starting history cleaner for instance of OllamaAI`);
    if (this.isCleanerRunning) {
      return;
    }

    // NOTE: Auto removing context/old messages after 5 minutes, calling shift twice to remove also responses;
    setInterval(() => {
      this.history.shift();
      this.history.shift();
    }, 180_000);
  }

  private getAllowdModel(model: string): string {
    if (ALLOWED_MODELS.includes(model)) {
      return model;
    }

    logger.info(`Falling back to model ${ALLOWED_MODELS[0]}`);
    return ALLOWED_MODELS[0];
  }

  public shouldRunOnThatMessage(message: string): boolean {
    if (message.includes("@BellaBotrix")) {
      return true;
    }

    return false;
  }

  public async ask(q: string, username: string): Promise<TOption<string>> {
    const message: Message = {
      role: "user",
      content: `User ${username} wrote: ${q}`,
    };

    try {
      const res = await OllamaAI.queue.enqueue(
        async () =>
          await OllamaAI.ollama?.chat({
            model: this.getAllowdModel(this.model),
            messages: [
              ...DEFAULT_PART,
              this.defaultPrompt,
              this.languagePrompt,
              ...this.history,
              message,
            ],
          }),
      );

      if (!res) {
        return undefined;
      }

      this.addToHistory(message);
      this.addToHistory({
        role: "assistant",
        content: res.message.content.trim(),
      });

      return res.message.content.trim();
    } catch {
      return undefined;
    }
  }
}
