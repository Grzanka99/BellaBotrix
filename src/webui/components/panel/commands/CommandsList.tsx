import { Context } from "elysia";
import { SingleCommand } from "./SingleCommand";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";

export const CommandsList = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    return <div>Something went wrong, make sure that bot is authorized for your channel</div>;
  }

  const commands = await prisma.commands.findMany({ where: { channelName: `#${channel.name}` } });

  return (
    <>
      {commands.map((cmd) => (
        <SingleCommand {...cmd} />
      ))}
    </>
  );
};
