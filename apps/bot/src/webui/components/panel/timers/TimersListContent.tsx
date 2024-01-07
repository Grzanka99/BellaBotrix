import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";
import { SingleTimer } from "./SingleTimer";

export const TimersListContent = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    return <div>not found</div>;
  }

  const timers = await prisma.timers.findMany({
    where: { channelId: channel.id },
  });

  if (!timers.length) {
    return ;
  }

  return (
    <>
      {timers.map((el) => (
        <SingleTimer {...el} channelName={channel.name} />
      ))}
    </>
  );
};
