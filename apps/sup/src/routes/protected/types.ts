import type { InferContext, InputSchema, UnwrapRoute } from "elysia";
import type { TGroupApp } from "routes/group-app";

export const APIV1_SAFE_GROUP = "api/v1" as const;

export type TSafeRoutesApp = TGroupApp<typeof APIV1_SAFE_GROUP>;
export type TSafeRouteContext<Path extends string, Schema extends InputSchema = {}> = InferContext<
  TSafeRoutesApp,
  Path,
  UnwrapRoute<Schema, {}, Path>
>;
