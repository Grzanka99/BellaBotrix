import { SingleCommand } from "../SingleCommand";
import { prisma } from "services/db";
import { Context } from "elysia";
import { dbfc } from "webui/helpers";
import { z } from "zod";
import { getCommandFromDbByUniqueName } from "../helpers";

const BodySchema = z
  .object({
    uniqueName: z.string(),
    enabled: z.any(),
    alias: z.string(),
  })
  .and(z.record(z.string(), z.string()));

export const SaveCommand = async (ctx: Context) => {
  const parsedBody = BodySchema.safeParse(ctx.body);

  if (!parsedBody.success) {
    console.log(parsedBody.error, ctx.body);
    ctx.set.status = "Bad Request";
    return;
  }

  const { data } = parsedBody;

  data.enabled = dbfc(data.enabled);

  const messages: Record<string, string> = {};
  Object.keys(data).forEach((key) => {
    if (!key.startsWith("message.")) {
      return;
    }

    messages[key.substring(8)] = data[key];
    delete data[key];
  });

  await prisma.commands.update({
    where: {
      uniqueName: data.uniqueName,
    },

    data: {
      ...data,
      message: JSON.stringify(messages),
    },
  });

  const final = await getCommandFromDbByUniqueName(data.uniqueName);
  if (!final) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return <SingleCommand {...final} />;
};
