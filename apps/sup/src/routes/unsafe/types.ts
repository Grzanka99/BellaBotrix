import type { InferContext, InputSchema, UnwrapRoute } from "elysia";
import type { TGroupApp } from "routes/group-app";

export const APIV1_UNSAFE_GROUP = "api/v1/unsafe" as const;
export const UNSAFE_SETTINGS_SYNC = "/:channel/settings/sync" as const;
export const UNSAFE_IS_LIVE = "/:channel/islive" as const;
export const UNSAFE_AIMODELS_SYNC = "/aimodels/sync" as const;
export const NOTIFY_CHANNELS_LIST_UPDATE = "/channelslistupdate" as const;

export type TUnsafeRoutesApp = TGroupApp<typeof APIV1_UNSAFE_GROUP>;
export type TUnsafeRouteContext<
  Path extends string,
  Schema extends InputSchema = {},
> = InferContext<TUnsafeRoutesApp, Path, UnwrapRoute<Schema, {}, Path>>;
