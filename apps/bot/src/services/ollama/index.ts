import type { TOption } from "bellatrix";
import { Ollama, type Message } from "ollama";
import { prisma, prismaQueue } from "services/db";
import { AsyncQueue } from "utils/async-queue";
import { interpolate } from "utils/interpolate-string";
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

type TConfig = {
  language: string;
  model: string;
  defaultPrompt: string;
};

function newSystemMessage(content: string): Message {
  return {
    role: "system",
    content,
  };
}

async function getDefaultPrompts(config: TConfig): Promise<Message[]> {
  const res = (await prisma.ollamaAISetupPrompts.findMany({ orderBy: { order: "asc" } })).filter(
    (el) => el.enabled,
  );

  const mapped: Message[] = res.map((el) => {
    switch (el.name) {
      case "language": {
        return newSystemMessage(interpolate(el.text, { language: config.language || "English" }));
      }
      case "entryPrompt": {
        return newSystemMessage(config.defaultPrompt || el.text);
      }
    }

    return newSystemMessage(el.text);
  });

  return mapped;
}

export class OllamaAI {
  private static ollama: Ollama | undefined;
  private static queue: AsyncQueue;

  private history: Message[] = [];

  constructor(private channel: string) {
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
    if (message.toLowerCase().includes("@BellaBotrix".toLowerCase())) {
      return true;
    }

    return false;
  }

  private async registerInDatabase(
    config: TConfig,
    userMessage: string,
    response: string,
    username: string,
  ) {
    await prismaQueue.enqueue(() =>
      prisma.ollamaAIHistory.create({
        data: {
          channel: this.channel,
          model: config.model,
          language: config.language,
          entryPrompt: config.defaultPrompt,
          historySize: this.historySize,
          userMessage,
          response,
          username,
        },
      }),
    );
  }

  public forceHistoryClear(): void {
    this.history = [];
  }

  public async ask(q: string, username: string, config: TConfig): Promise<TOption<string>> {
    const message: Message = {
      role: "user",
      content: `User ${username} wrote: ${q}`,
    };

    const defaulPrompts = await getDefaultPrompts(config);

    const messages = [...defaulPrompts, ...this.history, message];
    console.log(messages);

    try {
      const res = await OllamaAI.queue.enqueue(
        async () =>
          await OllamaAI.ollama?.chat({
            model: this.getAllowdModel(config.model),
            messages,
          }),
      );

      if (!res) {
        return undefined;
      }

      const trimmed = res.message.content.trim();
      this.addToHistory(message);
      this.addToHistory({
        role: "assistant",
        content: trimmed,
      });

      await this.registerInDatabase(config, q, trimmed, username);

      return trimmed;
    } catch (_) {
      return undefined;
    }
  }
}
