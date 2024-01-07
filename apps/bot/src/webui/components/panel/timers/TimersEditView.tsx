import { Context } from "elysia";
import { getChannelFromCtx } from "webui/helpers";
import { R_TIMERS } from "webui/routes";
import { z } from "zod";

const BodySchema = z.object({
  message: z.string(),
  timeout: z.coerce.number(),
  id: z.coerce.number(),
});

export const TimersEditView = async (ctx: Context): Promise<JSX.Element | undefined> => {
  const channel = await getChannelFromCtx(ctx);
  if (!channel) {
    ctx.set.status = 404;
    return;
  }

  const timer = BodySchema.safeParse(ctx.body);

  if (!timer.success) {
    ctx.set.status = 401;
    return;
  }

  const { data } = timer;

  const id = `timer-${data.id}-${channel.name}`;

  return (
    <ul id={id}>
      <li>
        <textarea name="message">{data.message}</textarea>
        <input type="hidden" value={String(data.id)} name="id" />
      </li>
      <li>
        <input type="number" value={String(data.timeout)} name="timeout" />
      </li>
      <li>
        <button
          type="button"
          hx-include={`#${id}`}
          hx-post={`${R_TIMERS.PREFIX}${R_TIMERS.SAVE}`}
          hx-target={`#${id}`}
          hx-swap="outerHTML"
        >
          save
        </button>
      </li>
      <li>
        <button type="button">cancel</button>
      </li>
    </ul>
  );
};
