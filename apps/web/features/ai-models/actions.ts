"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

import {
  authorizeAction,
  fail,
  ok,
  parseInput,
  tryDb,
  type ActionFailure,
  type ActionResult,
} from "@/lib/server/action"
import { prisma } from "@/lib/server/db"
import { indicateAIModelsSync } from "@/lib/server/sync"

import { aiModelSelect } from "./queries"
import {
  AI_MODELS_SYNC_FAILED_STATUS,
  SCreateAIModel,
  SDeleteAIModel,
  SUpdateAIModel,
  type AIModel,
  type AvailableModel,
} from "./schema"

/**
 * Ports of `POST|PUT|DELETE /api/admin/ai-models` (admin only) and
 * `GET /api/admin/ai-models/models` (OpenRouter list, admin only).
 *
 * Sync semantics (Nuxt): the DB write happens first, then
 * `await indicateAIModelsSync()` inside the same try, so an unreachable
 * sync service turns the response into an error although the change is
 * already saved. Same here: the write is kept, the page is revalidated, and
 * the action returns a failure with `AI_MODELS_SYNC_FAILED_STATUS` and a
 * message saying exactly that.
 */

const AI_MODELS_PATH = "/panel/admin/ai/models"

async function syncAfterWrite(): Promise<ActionFailure | null> {
  revalidatePath(AI_MODELS_PATH)
  try {
    await indicateAIModelsSync()
    return null
  } catch (error) {
    console.warn("[sync] indicateAIModelsSync failed:", error)
    return fail(
      "The change was saved, but the bot could not be notified (sync service unreachable). It will pick it up after its next reload.",
      AI_MODELS_SYNC_FAILED_STATUS
    )
  }
}

export async function createAIModel(
  input: unknown
): Promise<ActionResult<AIModel>> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SCreateAIModel, input)
  if (!parsed.ok) return parsed

  const created = await tryDb(
    () =>
      prisma.ollamaAIModels.create({
        data: { ...parsed.data, enabled: true },
        select: aiModelSelect,
      }),
    "Error occurred while creating model"
  )
  if (!created.ok) return created

  const syncFailure = await syncAfterWrite()
  if (syncFailure) return syncFailure

  return ok(created.data)
}

export async function updateAIModel(input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SUpdateAIModel, input)
  if (!parsed.ok) return parsed

  const { id, ...data } = parsed.data
  const updated = await tryDb(
    () => prisma.ollamaAIModels.updateMany({ where: { id }, data }),
    "Error occurred while updating model"
  )
  if (!updated.ok) return updated
  if (updated.data.count === 0) return fail("Model not found", 404)

  const syncFailure = await syncAfterWrite()
  if (syncFailure) return syncFailure

  return ok()
}

export async function deleteAIModel(input: unknown): Promise<ActionResult> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const parsed = parseInput(SDeleteAIModel, input)
  if (!parsed.ok) return parsed

  const deleted = await tryDb(
    () => prisma.ollamaAIModels.deleteMany({ where: { id: parsed.data.id } }),
    "Error occurred while deleting model"
  )
  if (!deleted.ok) return deleted
  if (deleted.data.count === 0) return fail("Model not found", 404)

  const syncFailure = await syncAfterWrite()
  if (syncFailure) return syncFailure

  return ok()
}

const SOpenRouterModel = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string().nullish(),
  context_length: z.number().nullish(),
  pricing: z
    .object({
      prompt: z.union([z.string(), z.number()]),
      completion: z.union([z.string(), z.number()]),
    })
    .nullish(),
})

const SOpenRouterResponse = z.object({ data: z.array(z.unknown()) })

const OPENROUTER_TIMEOUT_MS = 10_000

/**
 * Port of `GET /api/admin/ai-models/models`: server-side fetch of
 * `${OPENROUTER_API_URL}/models` (no user input in the URL), zod-validated.
 * Called lazily by the create/edit dialogs. Entries that don't validate are
 * skipped instead of failing the whole list.
 */
export async function getOpenRouterModels(): Promise<
  ActionResult<AvailableModel[]>
> {
  const auth = await authorizeAction({ perms: ["admin"] })
  if (!auth.ok) return auth

  const baseUrl = process.env.OPENROUTER_API_URL
  if (!baseUrl) {
    return fail(
      "The OpenRouter models list is not configured on the server",
      503
    )
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/+$/, "")}/models`, {
      cache: "no-store",
      signal: AbortSignal.timeout(OPENROUTER_TIMEOUT_MS),
    })
    if (!res.ok) {
      console.warn(`[openrouter] /models answered ${res.status}`)
      return fail("Could not load the OpenRouter models list", 502)
    }

    const parsed = SOpenRouterResponse.safeParse(await res.json())
    // Nuxt: an unexpected shape yields an empty list.
    if (!parsed.success) return ok([])

    const models: AvailableModel[] = []
    for (const raw of parsed.data.data) {
      const entry = SOpenRouterModel.safeParse(raw)
      if (!entry.success) continue
      const { id, name, description, context_length, pricing } = entry.data
      models.push({
        name,
        model: id,
        description: description ?? "",
        contextLength: context_length ?? null,
        pricing: pricing
          ? `In: ${pricing.prompt}$ / Out: ${pricing.completion}$`
          : "",
      })
    }

    return ok(models)
  } catch (error) {
    console.warn("[openrouter] fetching /models failed:", error)
    return fail("Could not load the OpenRouter models list", 502)
  }
}
