import { prisma } from "services/db";
import { SingleCommand } from "../SingleCommand";
import { getUniqueName } from "services/commands";
import { Context } from "elysia";
import { z } from "zod";
import { dbCommandToCommand } from "services/commands/commands.transform";

const BodySchema = z.object({
  name: z.string(),
  message: z.string(),
  channelName: z.string(),
});

export const AddCommand = async (ctx: Context) => {
  const parsedBody = BodySchema.safeParse(ctx.body);

  if (!parsedBody.success) {
    ctx.set.status = "Bad Request";
    return;
  }

  const { name, channelName, message } = parsedBody.data;

  const newCmd = await prisma.commands.create({
    data: {
      uniqueName: getUniqueName(name, channelName),
      channelName: `#${channelName}`,
      name,
      message: JSON.stringify({ base: message }),
      enabled: true,
      alias: "",
    },
  });

  if (!newCmd) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  const data = dbCommandToCommand(newCmd);

  if (!data) {
    ctx.set.status = "Internal Server Error";
    return;
  }

  return <SingleCommand {...data} />;
};
