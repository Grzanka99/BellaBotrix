import { TCommand } from "types/schema/commands.schema";
import { R_COMMANDS } from "webui/routes";

export const SingleCommand = (props: TCommand) => (
  <ul id={`command-row-${props.name}`}>
    <input type="hidden" value={props.uniqueName} name="uniqueName" />
    <li>{props.name}</li>
    <li>{String(props.enabled)}</li>
    <li class="command-row__messages">
      <ul class="command-row__messages__msg-list">
        {Object.keys(props.message).map((key) => (
          <li>
            <code>{key}</code>
            <span>{props.message[key]}</span>
          </li>
        ))}
      </ul>
    </li>
    <li>{props.alias ? props.alias.join(", "): ''}</li>
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
