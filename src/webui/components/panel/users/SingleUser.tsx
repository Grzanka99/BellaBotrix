import { TSingleUiUser } from "webui/types";

export const SingleUser = (props: TSingleUiUser) => {
  return <tr>
    <td>{props.userid}</td>
    <td>{props.username}</td>
    <td>{props.channel}</td>
    <td>{props.sentMessages}</td>
    <td>{props.points}</td>
  </tr>
}
