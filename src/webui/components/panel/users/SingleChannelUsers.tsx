import { Context } from "elysia";
import { prisma } from "services/db";
import { SingleUser } from "./SingleUser";

export const SingleChannelUserList = async (ctx: Context, starting?: string) => {
  if (!starting && !ctx.query.channel && !ctx.query.channel?.length) {
    return undefined;
  }

  const search = ctx.query.search;

  const users = await prisma.user.findMany({
    where: {
      channel: `#${String(starting || ctx.query.channel)}`,
      AND: search?.length
        ? {
            username: {
              contains: search,
            },
          }
        : undefined,
    },
  });

  if (!users || !users.length) {
    return (
      <ul>
        <li>Not found</li>
      </ul>
    );
  }

  return (
    <>
      {users.map((user) => (
        <SingleUser {...user} />
      ))}
    </>
  );
};
