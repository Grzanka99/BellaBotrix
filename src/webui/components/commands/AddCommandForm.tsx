export const AddCommandForm = () => (
  <form
    hx-post="/panel/add-command"
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
