import {useAuthSession} from '../../utils/session'

export default defineEventHandler(async (event) => {
  const session = await useAuthSession(event);
  await session.clear();
  return {
    message: "Logged out"
  }
});
