import { logger } from "utils/logger";
import { OllamaAIProvider } from "./providers/ollama";
import { prisma, prismaQueue, storage } from "services/db";
import type { TOption } from "bellatrix";
import type { THistoryItem } from "./types";
import type { OllamaAIModels } from "@prisma/client";
import { interpolate } from "utils/interpolate-string";
import { GeminiAIProvider } from "./providers/gemini";

type TConfig = {
  language: string;
  model: string;
  defaultPrompt: string;
};

function newSystemMessage(content: string): THistoryItem {
  return {
    role: "system",
    content,
  };
}

async function getDefaultPrompts(config: TConfig): Promise<THistoryItem[]> {
  const res = (await prisma.ollamaAISetupPrompts.findMany({ orderBy: { order: "asc" } })).filter(
    (el) => el.enabled,
  );

  const mapped: THistoryItem[] = res.map((el) => {
    switch (el.name) {
      case "language": {
        return newSystemMessage(interpolate(el.text, { language: config.language || "English" }));
      }
      case "entryPrompt": {
        return newSystemMessage(config.defaultPrompt || el.text);
      }
      default: {
        return newSystemMessage(el.text);
      }
    }
  });

  return mapped;
}

export class AIConnector {
  private static ollamaProvider = OllamaAIProvider.instance;
  private static geminiProvider = GeminiAIProvider.instance;

  public static instances = new Map<string, AIConnector>();

  private static skeymodels = "aimodels";
  private static synced = false;

  private constructor(private channel: string) {
    if (!storage.has(this.historyStorageKey)) {
      storage.set(this.historyStorageKey, []);
    }

    if (!AIConnector.synced) {
      this.syncModels();
    }
  }
  public static getInstance(ch: string): AIConnector {
    const instance = AIConnector.instances.get(ch);

    if (instance) {
      return instance;
    }

    const newInstance = new AIConnector(ch);

    AIConnector.instances.set(ch, newInstance);
    return newInstance;
  }

  private get historyStorageKey() {
    return `${this.channel}-aichatter-history`;
  }

  private async syncModels() {
    const res = await prisma.ollamaAIModels.findMany();

    storage.set(AIConnector.skeymodels, res);
    AIConnector.synced = true;
  }

  private get models(): OllamaAIModels[] {
    const res = storage.get<OllamaAIModels[]>(AIConnector.skeymodels);

    if (!res) {
      return [];
    }

    return res.value.filter((el) => el.enabled);
  }

  private historySize = 0;
  public setHistorySize(size: number) {
    // NOTE: x2 to keep every reponse also
    this.historySize = size * 2;
  }

  private addToHistory(message: THistoryItem) {
    const history = (storage.get(this.historyStorageKey)?.value || []) as THistoryItem[];

    if (history.length >= this.historySize) {
      history.shift();
    }

    history.push(message);
    storage.set(this.historyStorageKey, history);
  }

  private isCleanerRunning = false;
  public startHistoryCleaner(channel: string) {
    logger.info(`[${channel}] Starting history cleaner for instance of AIConnector`);
    if (this.isCleanerRunning) {
      return;
    }

    // NOTE: Auto removing context/old messages after 5 minutes, calling shift twice to remove also responses;
    setInterval(() => {
      const history = (storage.get(this.historyStorageKey)?.value || []) as THistoryItem[];
      history.shift();
      history.shift();
      storage.set(this.historyStorageKey, history);
    }, 180_000);
  }

  private getAllowdModel(model: string): string {
    if (this.models.map((el) => el.name).includes(model)) {
      return model;
    }

    logger.info(`Falling back to model ${this.models[0]}`);
    return this.models[0].name;
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
    try {
      const history = (storage.get(this.historyStorageKey)?.value || []) as THistoryItem[];
      const defaultPrompts = await getDefaultPrompts(config);

      const modelinfo = this.models.find((el) => el.name === config.model);

      let res = undefined;

      switch (modelinfo?.provider) {
        case "gemini": {
          res = await AIConnector.geminiProvider.send(q, history, defaultPrompts, config.model);
          break;
        }
        case "ollama": {
          res = await AIConnector.ollamaProvider.send(q, history, defaultPrompts, config.model);
          break;
        }
        default: {
          logger.warning(
            `[AI_CONNECTOR] Defaulting to phi3 as error occured with config ${JSON.stringify(config)}`,
          );
          res = await AIConnector.ollamaProvider.send(q, history, defaultPrompts, "phi3");
          break;
        }
      }

      if (!res) {
        logger.error("[AI_CONNECTOR] something went wrong while generating response");
        return undefined;
      }

      this.addToHistory({
        role: "user",
        content: q,
      });
      this.addToHistory({
        role: "assistant",
        content: res,
      });

      await this.registerInDatabase(config, q, res, username);

      return res;
    } catch (_) {
      return undefined;
    }
  }
}
