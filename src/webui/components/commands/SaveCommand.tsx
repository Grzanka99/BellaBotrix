import { TSingleUiCommand } from "webui/types";
import { SingleCommand } from "./SingleCommand";
import { prisma } from "services/db";

export const SaveCommand = async (props: TSingleUiCommand) => {
  const res = await prisma.commands.update({
    where: {
      name: props.name,
    },
    data: {
      message: props.message,
      enabled: String(props.enabled) === "true",
      alias: props.alias,
    },
  });

  if(res) {
    return <SingleCommand {...res} />
  }

  return <SingleCommand {...props} enabled={String(props.enabled) === "on"} />;
};
