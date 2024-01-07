import type { TAuthSession } from "~/types/auth.type";

export default defineNuxtPlugin(async (nuxtApp) => {
  if (nuxtApp.payload.error) {
    return {};
  }

  const { data: session, refresh: updateSession } =
    await useFetch<TAuthSession>("/api/auth/session");

  const loggedIn = computed<boolean>(() => !!session.value?.username);

  const redirectTo = useState<string | null>("authRedirect");

  addRouteMiddleware(
    "auth",
    (to) => {
      if (to.meta.auth && !loggedIn.value) {
        redirectTo.value = to.path;
        return "/login";
      }
    },
    { global: true },
  );

  const currentRoute = useRoute();

  if (process.client) {
    watch(loggedIn, async (loggedIn) => {
      if (!loggedIn && currentRoute.meta.auth) {
        redirectTo.value = currentRoute.path;
        await navigateTo("/login");
      }
    });
  }

  if (loggedIn.value && currentRoute.path === "/login") {
    await navigateTo(redirectTo.value || "/");
  }

  return {
    provide:{auth:
    
    {
      loggedIn,
      session,
      redirectTo,
      updateSession,
    },
    }
  };
});
