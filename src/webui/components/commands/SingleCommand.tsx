import { TSingleUiCommand } from "webui/types";

export const SingleCommand = (props: TSingleUiCommand) => (
  <tr id={`command-row-${props.name}`}>
    <td>
      {props.name}
      <input type="hidden" value={props.name} name="name" />
    </td>
    <td>
      {props.enabled}
      <input type="hidden" value={String(props.enabled)} name="enabled" />
    </td>
    <td>
      {props.message}
      <input type="hidden" value={props.message || ""} name="message" />
    </td>
    <td>
      {props.alias}
      <input type="hidden" value={props.alias} name="alias" />
    </td>
    <td>
      <button
        type="button"
        hx-post="/panel/edit-command"
        hx-target={`#command-row-${props.name}`}
        hx-swap="outerHTML"
        hx-include={`#command-row-${props.name}`}
      >
        edit
      </button>
    </td>
  </tr>
);
