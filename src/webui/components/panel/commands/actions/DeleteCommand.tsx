import { prisma } from "services/db";
import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";

export const DeleteCommand = async (props: TSingleUiCommand) => {
  try {
    await prisma.commands.delete({
      where: {
        name: props.name,
      },
    });

    return <></>;
  } catch (err) {
    return <SingleCommand {...props} />;
  }
};
