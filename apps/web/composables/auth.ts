import type { AsyncDataExecuteOptions } from "nuxt/dist/app/composables/asyncData";
import type { TAuthSession } from "~/types/auth.type";

export const useAuth = () =>
  useNuxtApp().$auth as {
    loggedIn: ComputedRef<boolean>;
    session: Ref<TAuthSession | null>;
    redirectTo: Ref<string | null>;
    updateSession: (opts?: AsyncDataExecuteOptions | undefined) => Promise<TAuthSession | null>;
  };

export const authLogin = async (username: string, password: string) => {
  await $fetch("/api/auth/login", {
    method: "POST",
    body: {
      username,
      password,
    },
  });
  useAuth().redirectTo.value = null;
  await useAuth().updateSession();
  await navigateTo(useAuth().redirectTo.value || "/");
};

export const authRegister = async (username: string, password: string) => {
  await $fetch("/api/auth/register", {
    method: "POST",
    body: {
      username,
      password,
    },
  });
  return await authLogin(username, password);
};

export const authLogout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  await useAuth().updateSession();
};
