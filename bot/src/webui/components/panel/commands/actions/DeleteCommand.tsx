import { prisma } from "services/db";
import { Context } from "elysia";

type TBody = {
  uniqueName: string | undefined;
};

export const DeleteCommand = async (ctx: Context) => {
  const { uniqueName } = ctx.body as TBody;

  if (!uniqueName) {
    ctx.set.status = "Bad Request";
    return;
  }

  try {
    await prisma.commands.delete({ where: { uniqueName } });

    return undefined;
  } catch (err) {
    ctx.set.status = "Internal Server Error";
    return;
  }
};
