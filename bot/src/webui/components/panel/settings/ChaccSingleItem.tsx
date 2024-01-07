import { R_SETTINGS, R_USERS } from "webui/routes";
import { TSingleUiChacc } from "webui/types";

export const ChaccSingleItem = (props: TSingleUiChacc) => {
  const id = `chacc-item-${props.username}-${props.accessLevel}`;
  return (
    <ul id={id}>
      <li>{props.username}
        <input type="hidden" name="username" value={props.username} />
      </li>
      <li>{props.accessLevel}</li>
      <li>
        <button
          type="button"
          hx-delete={`${R_SETTINGS.PREFIX}${R_SETTINGS.CHACC}`}
          hx-target={`#${id}`}
          hx-swap="outerHTML"
          hx-include={`#${id}`}
        >
          revoke
        </button>
      </li>
    </ul>
  );
};
