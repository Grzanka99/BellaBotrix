import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";
import { z } from "zod";

const BodySchema = z.object({ id: z.coerce.number() });

export const RemoveTimer = async (ctx: Context): Promise<undefined> => {
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

  try {
    await prisma.timers.delete({
      where: { id: data.id },
    });

    return;
  } catch (err) {
    ctx.set.status = 500;
    return;
  }
};
