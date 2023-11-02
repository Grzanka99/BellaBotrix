import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { R_COMMANDS } from "webui/routes";

export const AddCommandForm = async (ctx: Context) => {
  const channel = await getChannelFromCtx(ctx);

  if (!channel) {
    return <div>Something went wrong, make sure that bot is authorized for your channel</div>;
  }

  return (
    <form
      id="add-command-form"
      hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.ADD}`}
      hx-target="#commands-list"
      hx-swap="beforeend"
    >
      <input type="hidden" name="channelName" value={channel.name} />

      <label>
        name: <input type="text" name="name" />{" "}
      </label>
      <label>
        message: <input type="text" name="message" />{" "}
      </label>
      <button type="submit">Add new command</button>
    </form>
  );
};
