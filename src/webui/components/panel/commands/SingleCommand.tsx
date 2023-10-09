import { R_COMMANDS } from "webui/routes";
import { TSingleUiCommand } from "webui/types";

export const SingleCommand = (props: TSingleUiCommand) => (
  <ul id={`command-row-${props.name}`}>
    <li>
      {props.name}
      <input type="hidden" value={props.name} name="name" />
    </li>
    <li>
      {props.enabled}
      <input type="hidden" value={String(props.enabled)} name="enabled" />
    </li>
    <li>
      {props.message}
      <input type="hidden" value={props.message || ""} name="message" />
    </li>
    <li>
      {props.alias}
      <input type="hidden" value={props.alias} name="alias" />
    </li>
    <li>
      <button
        class="edit-button"
        type="button"
        hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.EDIT}`}
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        edit
      </button>
    </li>
    <li>
      <button
        class="delete-button"
        type="button"
        hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.DELETE}`}
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        delete
      </button>
    </li>
  </ul>
);
