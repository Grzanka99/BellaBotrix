import type { H3Event, SessionConfig } from "h3";
import { TAuthSession } from "~/types/auth.type";

const sessionConfig: SessionConfig = useRuntimeConfig().auth || {};

export const useAuthSession = async (event: H3Event) => {
  const session = await useSession<TAuthSession>(event, sessionConfig);
  return session;
};

export const requireAuthSession = async (event: H3Event) => {
  const session = await useAuthSession(event);
  if (!session.data.username) {
    throw createError({
      message: "Unauthorized",
      statusCode: 401,
    });
  }
  return session;
};
