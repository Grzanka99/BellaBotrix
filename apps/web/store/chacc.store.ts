import type { ChannelAccess } from "@prisma/client";
import { SettingsSchema } from "commontypes";

export const useChaccStore = defineStore("chacc", () => {
  const auth = useAuth();

  const chacc = ref<(ChannelAccess & { username: string })[]>([]);

  const { data, refresh } = useFetch(() => "/api/channalaccess");

  watch(data, () => {
    chacc.value = data.value || [];
  });

  return {
    chacc,
  };
});
