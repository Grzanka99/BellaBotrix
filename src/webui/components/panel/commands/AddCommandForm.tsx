import { R_COMMANDS } from "webui/routes";

export const AddCommandForm = () => (
  <form
    id="add-command-form"
    hx-post={`${R_COMMANDS.PREFIX}${R_COMMANDS.ADD}`}
    hx-target="#commands-list"
    hx-swap="beforeend"
  >
    <label>
      name: <input type="text" name="name" />{" "}
    </label>
    <label>
      message: <input type="text" name="message" />{" "}
    </label>
    <button type="submit">Add new command</button>
  </form>
);
