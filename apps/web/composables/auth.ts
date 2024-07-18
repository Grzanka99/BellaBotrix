import type { AsyncDataExecuteOptions } from "#app/composables/asyncData";
import { usePopupsStore } from "~/store/popups.store";
import type { TAuthSession, TDtoCreateUser } from "~/types/auth.type";
import { EPopupType } from "~/types/popup.type";

export const useAuth = () => {
  return useNuxtApp().$auth as {
    loggedIn: ComputedRef<boolean>;
    session: Ref<TAuthSession | null>;
    redirectTo: Ref<string | null>;
    updateSession: (opts?: AsyncDataExecuteOptions | undefined) => Promise<TAuthSession | null>;
  };
};

export const authLogin = async (username: string, password: string) => {
  try {
    await $fetch("/api/auth/login", {
      method: "POST",
      body: {
        username,
        password,
      },
    });
    useAuth().redirectTo.value = null;
    await useAuth().updateSession();
    navigateTo(useAuth().redirectTo.value || "/panel");

    usePopupsStore().add({
      headline: "Logged in successfully",
      details: [],
      timeout: 2000,
      type: EPopupType.Success,
    });
  } catch (err) {
    usePopupsStore().add({
      headline: "Incorrect username or password",
      details: ["Couldn't login. Check your username and password"],
      timeout: 10000,
      type: EPopupType.Error,
    });
  }
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
