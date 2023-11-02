import { R_COMMANDS } from "webui/routes";
import { TSingleUiCommand } from "webui/types";

export const EditCommand = (props: TSingleUiCommand) => (
  <ul id={`command-row-${props.name}`} class="command-row--edit-mode">
    <li>
      <input type="text" disabled value={props.name} name="name" />
      <input type="hidden" value={props.name} name="name" />
    </li>
    <li>
      <input type="checkbox" name="enabled" checked={String(props.enabled) === "true"} />
    </li>
    <li>
      <textarea name="message">{props.message || ""}</textarea>
    </li>
    <li>
      <input type="text" value={props.alias} name="alias" />
    </li>
    <li>
      <button
        type="button"
        hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.SAVE}`}
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        save
      </button>
    </li>
    <li>
      <button
        type="button"
        hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.CANCEL}`}
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        cancel
      </button>
    </li>
  </ul>
);
