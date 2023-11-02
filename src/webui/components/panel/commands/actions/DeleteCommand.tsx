import { prisma } from "services/db";
import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";
import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { getUniqueName } from "services/commands";

export const DeleteCommand = async (props: TSingleUiCommand, ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if(!channel) {
    return <SingleCommand {...props} />;
  }

  try {
    await prisma.commands.delete({
      where: {
        uniqueName: getUniqueName(props.name, channel.name)
      },
    });

    return <></>;
  } catch (err) {
    return <SingleCommand {...props} />;
  }
};
