import { SingleCommand } from "../SingleCommand";
import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { getCommandFromDbByUniqueName } from "../helpers";

type TBody = {
  uniqueName: string | undefined;
};

export const CancelCommand = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    return undefined;
  }

  const { uniqueName } = ctx.body as TBody;

  if (!uniqueName) {
    ctx.set.status = "Bad Request";
    return;
  }

  const data = await getCommandFromDbByUniqueName(uniqueName);
  if (!data) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return <SingleCommand {...data} />;
};
