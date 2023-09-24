import { prisma } from "services/db";
import { SingleCommand } from "./SingleCommand";
import { TNewUiCommand } from "webui/types";

export const AddCommand = async (body: TNewUiCommand) => {
  const { name, message } = body;

  if (!name || !message) {
    return undefined;
  }

  const newCmd = await prisma.commands.create({
    data: {
      name,
      message,
      enabled: true,
      alias: "",
    },
  });

  return <SingleCommand {...newCmd} />;
};
