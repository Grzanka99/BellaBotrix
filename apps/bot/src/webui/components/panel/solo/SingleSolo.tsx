import { R_SOLO } from "webui/routes";
import { TSingleUiSolo } from "webui/types";

export const SingleSolo = (props: TSingleUiSolo) => {
  return (
    <ul id={`solo-row-${props.id}`}>
      <li>
        {props.id}
        <input type="hidden" value={String(props.id)} name="id" />
      </li>
      <li>
        {props.user1}
        <input type="hidden" value={props.user1} name="user1" />
      </li>
      <li>
        {props.user2}
        <input type="hidden" value={props.user2} name="user2" />
      </li>
      <li>
        {props.points}
        <input type="hidden" value={String(props.points)} name="points" />
      </li>
      <li>
        {props.winner ? (
          <>
            {props.winner}
            <input type="hidden" value={props.winner} name="winner" />
          </>
        ) : (
          "undecided"
        )}
      </li>
      <li>
        {props.inProgress ? (
          <button
            class="delete-button"
            type="button"
            hx-post={`${R_SOLO.PREFIX}${R_SOLO.CLOSE}`}
            hx-target={`#solo-row-${props.id}`}
            hx-swap="outerHTML"
            hx-include={`#solo-row-${props.id}`}
          >
            close
          </button>
        ) : (
          String(false)
        )}
      </li>

      <input type="hidden" value={props.channel} name="channel" />
    </ul>
  );
};
