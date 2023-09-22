import { prisma } from "services/db";
import { SingleCommand } from "./SingleCommand";

type TNewCmd = {
  name: string | undefined;
  message: string | undefined;
};

export const AddCommand = async (body: TNewCmd) => {
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
