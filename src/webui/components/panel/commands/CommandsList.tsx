import { prisma } from "services/db";
import { SingleCommand } from "./SingleCommand";

export const CommandsList = async (): Promise<JSX.Element> => {
  const commands = await prisma.commands.findMany();

  return (
    <table class="db-entries-table">
      <thead>
        <tr>
          <td>name</td>
          <td>enabled</td>
          <td>message</td>
          <td>aliases</td>
        </tr>
      </thead>
      <tbody id="commands-list">
        {commands.map((cmd) => (
          <SingleCommand {...cmd} />
        ))}
      </tbody>
    </table>
  );
};
