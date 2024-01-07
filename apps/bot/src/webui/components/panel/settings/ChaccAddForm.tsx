import { EChannelAccessLevel } from "types";
import { R_SETTINGS } from "webui/routes";

export const ChaccAddForm = () => {
  return (
    <ul id="new-chacc-item">
      <li>
        <input type="text" name="username" />
      </li>
      <li>
        <select name="accessLevel">
          <option value={EChannelAccessLevel.Mod}>Moderator</option>
          <option value={EChannelAccessLevel.Owner}>Admin (same as mod)</option>
          <option value={EChannelAccessLevel.Editor}>Editor (same as mod)</option>
          <option value={EChannelAccessLevel.Viewer}>Moderator (same as mod)</option>
        </select>
      </li>
      <li>
        <button
          type="button"
          hx-post={`${R_SETTINGS.PREFIX}${R_SETTINGS.CHACC}`}
          hx-target="#new-chacc-item"
          hx-swap="beforebegin"
          hx-include="#new-chacc-item"
        >
          add
        </button>
      </li>
    </ul>
  );
};
