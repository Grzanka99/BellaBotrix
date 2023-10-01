import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "../SingleCommand";
import { prisma } from "services/db";

export const SaveCommand = async (props: TSingleUiCommand) => {
  try {
    const res = await prisma.commands.update({
      where: {
        name: props.name,
      },
      data: {
        message: props.message,
        enabled: String(props.enabled) === "true" || String(props.enabled) === "on",
        alias: props.alias,
      },
    });

      return <SingleCommand {...res} />;

  } catch (err) {
    <SingleCommand {...props} />;
  }
};
