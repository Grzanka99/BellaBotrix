import { prisma } from "services/db";
import { SingleUser } from "./SingleUser";
import { R_USERS } from "webui/routes";

export const UsersList = async () => {
  const users = await prisma.user.findMany();

  if (!users) {
    return <h2>DB Error</h2>;
  }

  const groupedByChannel: Record<string, typeof users> = {};

  users.forEach((user) => {
    if (user.channel in groupedByChannel) {
      groupedByChannel[user.channel].push(user);
    } else {
      groupedByChannel[user.channel] = [user];
    }
  });

  return (
    <div
            hx-get={`${R_USERS.PREFIX}${R_USERS.LIST}`}
            hx-trigger="every 2s"
            hx-swap="outerHTML"
    >
      {Object.keys(groupedByChannel).map((channel) => (
        <>
          <h2>{channel}</h2>
          <table
            class="db-entries-table"
          >
            <thead>
              <tr>
                <td>userid</td>
                <td>username</td>
                <td>channel</td>
                <td>sentMessages</td>
                <td>points</td>
              </tr>
            </thead>
            <tbody>
              {groupedByChannel[channel].map((user) => (
                <SingleUser {...user} />
              ))}
            </tbody>
          </table>
        </>
      ))}
    </div>
  );
};
