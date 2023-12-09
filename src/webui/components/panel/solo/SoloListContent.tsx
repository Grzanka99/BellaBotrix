import { Context } from "elysia";
import { prisma } from "services/db";
import { SingleSolo } from "./SingleSolo";
import { R_SOLO } from "webui/routes";
import { getChannelFromCtx } from "webui/helpers";

const HTMXWrapper = ({ children }: { children: JSX.Element }) => (
  <div
    id="solo-list"
    class="grid-based-table__content"
    hx-get={`${R_SOLO.PREFIX}${R_SOLO.LIST}`}
    hx-trigger="every 2s"
    hx-target="#solo-list"
    hx-swap="outerHTML"
  >
    {children}
  </div>
);

export const SoloListContent = async (ctx: Context): Promise<JSX.Element> => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    return <HTMXWrapper>not found</HTMXWrapper>;
  }

  const soloList = await prisma.solo.findMany({ where: { channel: `#${channel.name}` } });
  return (
    <HTMXWrapper>
      <>
        {soloList.reverse().map((solo) => (
          <SingleSolo {...solo} />
        ))}
      </>
    </HTMXWrapper>
  );
};
