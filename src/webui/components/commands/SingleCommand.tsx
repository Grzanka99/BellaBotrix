type TProps = {
  id: number;
  name: string;
  message: string | null;
  enabled: boolean;
  alias: string;
};

export const SingleCommand = (props: TProps) => (
  <tr>
    <td>{props.name}</td>
    <td>{props.enabled}</td>
    <td>{props.message}</td>
    <td>{props.alias}</td>
  </tr>
);
