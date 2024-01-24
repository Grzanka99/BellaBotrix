import { useStorage } from "@vueuse/core";
import type { TOption, TSettings, TSettingsUpdate } from "bellatrix";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<TOption<TSettings>>(undefined);
  const channel = useStorage("selectedChannel", undefined);

  const { data, refresh } = useFetch(() => `/api/${channel.value}/settings`);

  watch(data, () => {
    settings.value = data.value || undefined;
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const handleUpdate = async (v: TSettingsUpdate): Promise<void> => {
    const res = await $fetch(`/api/${channel.value}/settings`, {
      method: "PUT",
      body: v,
    });

    settings.value = res;
  };

  return {
    settings,
    startRefresh,
    stopRefresh,
    handleUpdateDebounce: useDebounceFn(handleUpdate, 500),
    handleUpdate,
  };
});
