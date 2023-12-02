import { Context } from "elysia";
import { prisma, prismaQueue } from "services/db";
import { z } from "zod";
import { SingleUser } from "../SingleUser";

const BodySchema = z.object({
  userid: z.string(),
});

export const MarkAsBot = async (ctx: Context, isBot: boolean) => {
  const parsedBody = BodySchema.safeParse(ctx.body);

  if (!parsedBody.success) {
    ctx.set.status = "Bad Request";
    return;
  }

  const { userid } = parsedBody.data;

  const marked = await prismaQueue.enqueue(() =>
    prisma.user.update({
      where: { userid },
      data: { isBot },
    }),
  );

  if (!marked) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return <SingleUser {...marked} />;
};
