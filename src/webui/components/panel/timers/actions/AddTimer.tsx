import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";
import { z } from "zod";
import { SingleTimer } from "../SingleTimer";

const BodySchema = z.object({
  message: z.string(),
  timeout: z.coerce.number(),
});

export const AddTimer = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    ctx.set.status = 404;
    return;
  }

  const parsed = BodySchema.safeParse(ctx.body);

  if (!parsed.success) {
    ctx.set.status = 400;
    return;
  }

  const { data } = parsed;

  try {
    const added = await prisma.timers.create({
      data: {
        channelId: channel.id,
        message: data.message,
        timeout: data.timeout,
      },
    });

    return <SingleTimer {...added} channelName={channel.name} />;
  } catch {
    ctx.set.status = 500;
    return;
  }
};
