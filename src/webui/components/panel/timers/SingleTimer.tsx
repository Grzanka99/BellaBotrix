import { Timers } from "@prisma/client";
import { R_TIMERS } from "webui/routes";

type TProps = Timers & {
  channelName: string;
};

export const SingleTimer = (el: TProps): JSX.Element => {
  const id = (v: number) => `timer-${v}-${el.channelName}`;

  return (
    <ul id={id(el.id)}>
      <li>
        {el.message}
        <input type="hidden" value={el.message} name="message" />
        <input type="hidden" value={String(el.id)} name="id" />
      </li>
      <li>
        {el.timeout ? `${el.timeout} seconds` : "disabled"}
        <input type="hidden" value={String(el.timeout)} name="timeout" />
      </li>
      <li>
        <button
          type="button"
          hx-delete={`${R_TIMERS.PREFIX}${R_TIMERS.DELETE}`}
          hx-include={`#${id(el.id)}`}
          hx-target={`#${id(el.id)}`}
          hx-swap="outerHTML"
        >
          delete
        </button>{" "}
      </li>
      <li>
        <button
          type="button"
          hx-post={`${R_TIMERS.PREFIX}${R_TIMERS.EDIT}`}
          hx-target={`#${id(el.id)}`}
          hx-swap="outerHTML"
          hx-include={`#${id(el.id)}`}
        >
          edit
        </button>
      </li>
    </ul>
  );
};
