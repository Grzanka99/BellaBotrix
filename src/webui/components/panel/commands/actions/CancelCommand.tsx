import { prisma } from "services/db";
import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";
import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { getUniqueName } from "services/commands";

export const CancelCommand = async (props: TSingleUiCommand, ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    return undefined;
  }

  const res = await prisma.commands.findUnique({
    where: {
      uniqueName: getUniqueName(props.name, channel.name),
    },
  });

  if (!res) {
    return <SingleCommand {...props} />;
  }

  return <SingleCommand {...res} />;
};
