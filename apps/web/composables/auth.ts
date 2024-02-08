import type { AsyncDataExecuteOptions } from "#app/composables/asyncData";
import type { TAuthSession, TDtoCreateUser } from "~/types/auth.type";

export const useAuth = () => {
  return useNuxtApp().$auth as {
    loggedIn: ComputedRef<boolean>;
    session: Ref<TAuthSession | null>;
    redirectTo: Ref<string | null>;
    updateSession: (opts?: AsyncDataExecuteOptions | undefined) => Promise<TAuthSession | null>;
  };
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
  await navigateTo(useAuth().redirectTo.value || "/panel");
};

export const authRegister = async (data: TDtoCreateUser) => {
  await $fetch("/api/auth/register", {
    method: "POST",
    body: {
      username: data.username,
      password: data.password,
      regToken: data.regToken,
    },
  });
  return await authLogin(data.username, data.password);
};

export const authLogout = async () => {
  await $fetch("/api/auth/logout", { method: "POST" });
  await useAuth().updateSession();
  useRouter().push("/login");
};
