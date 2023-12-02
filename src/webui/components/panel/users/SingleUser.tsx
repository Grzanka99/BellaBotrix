import { R_USERS } from "webui/routes";
import { TSingleUiUser } from "webui/types";

export const SingleUser = (props: TSingleUiUser) => {
  const id = `single-user-${props.userid}`.replace("@#", "--");

  return (
    <ul id={id} class={props.isBot ? 'marked-as-bot' : ''}>
      <input type="hidden" name="userid" value={props.userid} />
      <li>{props.userid}</li>
      <li>{props.username}</li>
      <li>{props.channel}</li>
      <li>{props.sentMessages}</li>
      <li>{props.points}</li>
      <li>
        {props.isBot ? (
          <button
            type="button"
            hx-post={`${R_USERS.PREFIX}${R_USERS.UNMARK_AS_BOT}`}
            hx-target={`#${id}`}
            hx-swap="outerHTML"
            hx-include={`#${id}`}
          >
            unmark bot
          </button>
        ) : (
          <button
            type="button"
            hx-post={`${R_USERS.PREFIX}${R_USERS.MARK_AS_BOT}`}
            hx-target={`#${id}`}
            hx-swap="outerHTML"
            hx-include={`#${id}`}
          >
            mark as bot
          </button>
        )}
      </li>
    </ul>
  );
};
