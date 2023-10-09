import { prisma } from "services/db";
import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";

export const CancelCommand = async (props: TSingleUiCommand) => {
  const res = await prisma.commands.findUnique({
    where: {
      name: props.name,
    },
  });

  if (!res) {
    return <SingleCommand {...props} />;
  }

  return <SingleCommand {...res} />;
};
