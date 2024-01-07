import { Context } from "elysia";
import { prisma } from "services/db";
import { getChannelFromCtx } from "webui/helpers";
import { ChaccAddForm } from "./ChaccAddForm";
import { ChaccSingleItem } from "./ChaccSingleItem";
import { TOption } from "types";

async function getUsernameById(id: number): Promise<TOption<string>> {
  const user = await prisma.webuiUser.findFirst({
    where: { id },
  });

  if (!user) {
    return undefined;
  }

  return user?.username;
}

export const ChannelAccessContent = async (ctx: Context): Promise<JSX.Element> => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    return (
      <div>
        <button type="button">add access</button>
      </div>
    );
  }

  const accessList = await prisma.channelAccess.findMany({
    where: {
      channelId: channel.id,
    },
  });

  return (
    <div class="grid-based-table__content">
      {
        await Promise.all(
          accessList.map(async (el) => (
            <ChaccSingleItem
              username={(await getUsernameById(el.userid)) || ""}
              accessLevel={el.accessLevel}
            />
          )),
        )
      }
      <ChaccAddForm />
    </div>
  );
};

export const ChannelAccessForm = async (ctx: Context, error = false) => {
  return (
    <div class="channel-access-form settings-form" id="channel-access-form">
      <h3>Channel Access</h3>
      <div class="grid-based-table">
        <div class="grid-based-table__header">
          <ul>
            <li>username</li>
            <li>access level</li>
            <li>controll</li>
          </ul>
        </div>
        {await ChannelAccessContent(ctx)}
      </div>
    </div>
  );
};
