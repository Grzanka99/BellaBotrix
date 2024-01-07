import { Context } from "elysia";
import { prisma } from "services/db";
import { SingleSolo } from "./SingleSolo";
import { getChannelFromCtx } from "webui/helpers";

export const SoloListContent = async (ctx: Context): Promise<JSX.Element> => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    return <div>not found</div>;
  }

  const soloList = await prisma.solo.findMany({ where: { channel: `#${channel.name}` } });
  return (
    <>
      {soloList.reverse().map((solo) => (
        <SingleSolo {...solo} />
      ))}
    </>
  );
};
