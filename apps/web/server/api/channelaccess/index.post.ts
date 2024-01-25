import { EChannelAccessLevel } from "bellatrix";
import { z } from "zod";

const BodySchema = z.object({
  username: z.string(),
  accessLevel: z.nativeEnum(EChannelAccessLevel),
});

export default defineEventHandler(async (event) => {
  const auth = await useAuthSession(event);

  if (!auth.data.channelId) {
    throw createError({
      statusCode: 401,
    });
  }

  const parsedBody = BodySchema.safeParse(await readBody(event));

  if (!parsedBody.success) {
    throw createError({
      statusCode: 400,
    });
  }

  const channel = await prisma.channel.findUnique({ where: { id: auth.data.channelId } });

  if (!channel) {
    throw createError({
      statusCode: 401,
    });
  }

  const { username, accessLevel } = parsedBody.data;

  const user = await prisma.webuiUser.findFirst({
    where: { username },
  });

  if (!user) {
    throw createError({
      statusCode: 400,
    });
  }

  const newEntry = await prisma.channelAccess.create({
    data: {
      userid: user.id,
      channelId: channel.id,
      accessLevel,
    },
  });

  if (!newEntry) {
    throw createError({
      statusCode: 500,
    });
  }

  return {
    ...newEntry,
    username,
  };
});
