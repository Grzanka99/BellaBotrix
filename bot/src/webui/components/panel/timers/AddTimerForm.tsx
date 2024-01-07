import { R_TIMERS } from "webui/routes";

export const AddTimerForm = () => {
  return (
    <form
      id="add-timers-form"
      hx-post={`${R_TIMERS.PREFIX}${R_TIMERS.ADD}`}
      hx-target="#timers-list"
      hx-swap="beforeend"
    >
      <label>
        message: <input type="text" name="message" />
      </label>
      <label>
        timeout: <input type="number" name="timeout" />
      </label>
      <button type="submit">Add new timer</button>
    </form>
  );
};
