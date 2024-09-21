import { t } from "elysia";
import type { TUnsafeRouteContext, UNSAFE_AIMODELS_SYNC } from "routes/unsafe/types";
import { SYNC_KEY } from "env";
import { prisma, storage } from "shared";

export const AIModelsSyncValidation = {
  body: t.Object({
    key: t.String(),
  }),
};

export function HandleAIModelsSync(
  ctx: TUnsafeRouteContext<typeof UNSAFE_AIMODELS_SYNC, typeof AIModelsSyncValidation>,
) {
  const { error, body } = ctx;

  if (body.key !== SYNC_KEY) {
    return error(401);
  }

  (async () => {
    const models = await prisma.ollamaAIModels.findMany();

    storage.set("ollamamodels", models);
  })();

  return {
    success: true,
  };
}
