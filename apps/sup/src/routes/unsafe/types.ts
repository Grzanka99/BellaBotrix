import type { Elysia, InferContext, InputSchema } from "elysia";

export const APIV1_UNSAFE_GROUP = "api/v1/unsafe" as const;
export const UNSAFE_SETTINGS_SYNC = "/:channel/settings/sync" as const;
export const UNSAFE_IS_LIVE = "/:channel/islive" as const;
export const UNSAFE_AIMODELS_SYNC = "/aimodels/sync" as const;
export const NOTIFY_CHANNELS_LIST_UPDATE = "/channelslistupdate" as const;

export type TUnsafeRoutesApp = Elysia<typeof APIV1_UNSAFE_GROUP>;
export type TUnsafeRouteContext<
  Path extends string,
  Schema extends InputSchema = InputSchema,
> = InferContext<TUnsafeRoutesApp, Path, Schema>;
