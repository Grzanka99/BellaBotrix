import { TSingleUiUser } from "webui/types";

export const SingleUser = (props: TSingleUiUser) => {
  return <ul>
    <li>{props.userid}</li>
    <li>{props.username}</li>
    <li>{props.channel}</li>
    <li>{props.sentMessages}</li>
    <li>{props.points}</li>
  </ul>
}
