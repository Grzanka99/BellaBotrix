import { prisma } from "services/db";
import { SingleCommand } from "../SingleCommand";
import { TNewUiCommand } from "webui/types";
import { getUniqueName } from "services/commands";

export const AddCommand = async (body: TNewUiCommand) => {
  const { name, message, channelName } = body;

  if (!name || !message || !channelName) {
    return undefined;
  }

  const newCmd = await prisma.commands.create({
    data: {
      uniqueName: getUniqueName(name, channelName),
      channelName: `#${channelName}`,
      name,
      message,
      enabled: true,
      alias: "",
    },
  });

  return <SingleCommand {...newCmd} />;
};
