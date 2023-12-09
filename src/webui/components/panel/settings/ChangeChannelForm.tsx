import { Context } from "elysia";
import { prisma } from "services/db";
import { R_SETTINGS } from "webui/routes";

export const ChangeChannelForm = async (ctx: Context) => {
  const authCookie = ctx.cookie.auth.value as {
    username?: string;
    key?: string;
    channelId?: string;
  };

  if (!authCookie || !authCookie.username || !authCookie.key) {
    ctx.set.redirect = "/login";
    return;
  }

  const user = await prisma.webuiUser.findFirst({ where: { username: authCookie.username } });
  if (!user) {
    ctx.set.redirect = "/login";
    return;
  }

  const accessList = await prisma.channelAccess.findMany({
    where: { userid: user.id },
  });

  const toChannels = await Promise.all(
    accessList.map(async (el) => {
      const res = await prisma.channel.findUnique({ where: { id: el.channelId } });
      if (res) {
        return {
          name: res.name,
          id: el.channelId,
        };
      }
    }),
  );

  return (
    <form
      class="change-channel-form settings-form"
      id="change-channel-form"
      method="post"
      action={`${R_SETTINGS.PREFIX}${R_SETTINGS.CHACH}`}
    >
      <h3>Change Channel (Context)</h3>
      <div>

      <select
        name="channelId"
      >
        {toChannels.filter(Boolean).map((el) => {
          const isSelected = String(el.id) === authCookie.channelId;
          return isSelected ? (
            <option value={String(el.id)} selected="selected">
              {el.name}
            </option>
          ) : (
            <option value={String(el.id)}>{el.name}</option>
          );
        })}
      </select>
      <button type="submit">change</button>
      </div>
    </form>
  );
};
