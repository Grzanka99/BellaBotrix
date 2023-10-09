import { prisma } from "services/db";
import { SingleCommand } from "./SingleCommand";

export const CommandsList = async (): Promise<JSX.Element> => {
  const commands = await prisma.commands.findMany();

  return (
    <div class="grid-based-table">
      <div class="grid-based-table__header">
        <ul>
          <li>name</li>
          <li>enabled</li>
          <li>message</li>
          <li>aliases</li>
        </ul>
      </div>
      <div id="commands-list" class="grid-based-table__content">
        {commands.map((cmd) => (
          <SingleCommand {...cmd} />
        ))}
      </div>
    </div>
  );
};
