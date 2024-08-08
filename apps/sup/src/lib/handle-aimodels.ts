import { prisma, storage } from "shared";

export async function handleAIModelsSync(): Promise<boolean> {
  const models = await prisma.ollamaAIModels.findMany();

  storage.set("ollamamodels", models);

  return true;
}
