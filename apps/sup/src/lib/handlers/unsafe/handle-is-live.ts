import { t } from "elysia";
import type { TUnsafeRouteContext, UNSAFE_IS_LIVE } from "routes/unsafe/types";
import { storage } from "shared";

export const IsLiveValidation = {
  params: t.Object({
    channel: t.String(),
  }),
};

export function HandleIsLive(
  ctx: TUnsafeRouteContext<typeof UNSAFE_IS_LIVE, typeof IsLiveValidation>,
) {
  const { params, error } = ctx;

  const channel = String(params.channel);

  if (!channel.length) {
    return error(404);
  }

  const chName = `#${channel.replaceAll("#", "")}`;

  const res = storage.get<boolean>(`${chName}_is_live`);

  if (!res) {
    return error(404);
  }

  return {
    islive: res.value,
  };
}
