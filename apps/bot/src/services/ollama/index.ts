import type { OllamaAIModels } from "@prisma/client";
import type { TOption } from "bellatrix";
import { Ollama, type Message } from "ollama";
import { prisma, prismaQueue, storage } from "services/db";
import { AsyncQueue } from "utils/async-queue";
import { interpolate } from "utils/interpolate-string";
import { logger } from "utils/logger";

const OLLAMA_API_URL = Bun.env.OLLAMA_API_URL;

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

  private static skeymodels = "ollamamodels";
  private static synced = false;

  constructor(private channel: string) {
    if (!OllamaAI.ollama) {
      OllamaAI.ollama = new Ollama({ host: OLLAMA_API_URL });
    }

    if (!OllamaAI.queue) {
      OllamaAI.queue = new AsyncQueue();
    }

    if (!storage.has(this.historyStorageKey)) {
      storage.set(this.historyStorageKey, []);
    }

    if (!OllamaAI.synced) {
      this.syncModels();
    }
  }

  private get historyStorageKey() {
    return `${this.channel}-ollama-history`;
  }

  private async syncModels() {
    const res = await prisma.ollamaAIModels.findMany();

    storage.set(OllamaAI.skeymodels, res);
    OllamaAI.synced = true;
  }

  private get models(): string[] {
    const res = storage.get<OllamaAIModels[]>(OllamaAI.skeymodels);

    if (!res) {
      return [];
    }

    return res.value.filter((el) => el.enabled).map((el) => el.name);
  }

  private historySize = 0;
  public setHistorySize(size: number) {
    // NOTE: x2 to keep every reponse also
    this.historySize = size * 2;
  }

  private addToHistory(message: Message) {
    const history = (storage.get(this.historyStorageKey)?.value || []) as Message[];

    if (history.length >= this.historySize) {
      history.shift();
    }

    history.push(message);
    storage.set(this.historyStorageKey, history);
  }

  private isCleanerRunning = false;
  public startHistoryCleaner(channel: string) {
    logger.info(`[${channel}] Starting history cleaner for instance of OllamaAI`);
    if (this.isCleanerRunning) {
      return;
    }

    // NOTE: Auto removing context/old messages after 5 minutes, calling shift twice to remove also responses;
    setInterval(() => {
      const history = (storage.get(this.historyStorageKey)?.value || []) as Message[];
      history.shift();
      history.shift();
      storage.set(this.historyStorageKey, history);
    }, 180_000);
  }

  private getAllowdModel(model: string): string {
    if (this.models.includes(model)) {
      return model;
    }

    logger.info(`Falling back to model ${this.models[0]}`);
    return this.models[0];
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
    storage.set(this.historyStorageKey, []);
  }

  public async ask(q: string, username: string, config: TConfig): Promise<TOption<string>> {
    const message: Message = {
      role: "user",
      content: `User ${username} wrote: ${q}`,
    };

    const history = (storage.get(this.historyStorageKey)?.value || []) as Message[];

    const defaulPrompts = await getDefaultPrompts(config);

    const messages = [...defaulPrompts, ...history, message];

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
