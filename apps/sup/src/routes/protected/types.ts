import type { Elysia, InferContext, InputSchema } from "elysia";

export const APIV1_SAFE_GROUP = "api/v1" as const;

export type TSafeRoutesApp = Elysia<typeof APIV1_SAFE_GROUP>;
export type TSafeRouteContext<
  Path extends string,
  Schema extends InputSchema = InputSchema,
> = InferContext<TSafeRoutesApp, Path, Schema>;
