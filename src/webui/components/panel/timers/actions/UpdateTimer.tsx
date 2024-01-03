import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { SingleTimer } from "../SingleTimer";
import { z } from "zod";
import { prisma } from "services/db";

const BodySchema = z.object({
  message: z.string(),
  timeout: z.coerce.number(),
  id: z.coerce.number(),
});

export const UpdateTimer = async (ctx: Context): Promise<JSX.Element | undefined> => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    ctx.set.status = 404;
    return;
  }

  const timer = BodySchema.safeParse(ctx.body);

  if (!timer.success) {
    ctx.set.status = 401;
    return;
  }

  const { data } = timer;

  const updated = await prisma.timers.update({
    where: { id: data.id },
    data: {
      timeout: data.timeout,
      message: data.message,
    },
  });

  return (
    <SingleTimer
      id={updated.id}
      channelId={updated.id}
      timeout={updated.timeout}
      message={updated.message}
      channelName={channel.name}
    />
  );
};
