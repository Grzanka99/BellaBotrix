import { TSingleUiCommand } from "webui/types";

export const EditCommand = (props: TSingleUiCommand) => (
  <tr id={`command-row-${props.name}`}>
    <td>
      <input type="text" disabled value={props.name} name="name" />
      <input type="hidden" value={props.name} name="name" />
    </td>
    <td>
      <input
        type="checkbox"
        name="enabled"
        checked={String(props.enabled) === "true"}
      />
    </td>
    <td>
      <input type="text" value={props.message || ""} name="message" />
    </td>
    <td>
      <input type="text" value={props.alias} name="alias" />
    </td>
    <td>
      <button
        type="button"
        hx-post="/panel/save-command"
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        save
      </button>
    </td>
  </tr>
);
