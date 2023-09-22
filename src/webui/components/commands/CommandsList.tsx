import { prisma } from "services/db";
import { SingleCommand } from "./SingleCommand";

export const CommandsList = async (): Promise<JSX.Element> => {
  const commands = await prisma.commands.findMany();

  return (
    <table id="commands-list">
      <thead>
        <tr>
          <td >name</td>
          <td >enabled</td>
          <td >message</td>
          <td >aliases</td>
        </tr>
      </thead>
      <tbody>
        {commands.map((cmd) => (
          <SingleCommand {...cmd} />
        ))}
      </tbody>
    </table>
  );
};
