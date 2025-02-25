import type { TOption } from "bellatrix";

export type THistoryItem = {
  content: string;
  role: "system" | "user" | "assistant";
};

export interface TAIProvider {
  send(
    text: string,
    history: THistoryItem[],
    systemSettings: THistoryItem[],
    model: string,
  ): Promise<TOption<string>>;
}

export enum EAIProviders {
  Ollama = "ollama",
  Gemini = "gemini",
}
