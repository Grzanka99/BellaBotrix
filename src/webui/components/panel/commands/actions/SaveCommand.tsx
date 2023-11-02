import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";
import { prisma } from "services/db";
import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { getUniqueName } from "services/commands";

export const SaveCommand = async (props: TSingleUiCommand, ctx: Context) => {
  try {
    const channel = await getChannelFromCtx(ctx);

    if (!channel) {
      throw "Channel not found";
    }

    const res = await prisma.commands.update({
      where: {
        uniqueName: getUniqueName(props.name, channel.name),
      },
      data: {
        message: props.message,
        enabled: !!props.enabled,
        alias: props.alias,
      },
    });

    return <SingleCommand {...res} />;
  } catch (err) {
    <SingleCommand {...props} />;
  }
};
