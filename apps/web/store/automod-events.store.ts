import type { AutomodEvents } from "@prisma/client";
import { useStorage } from "@vueuse/core";

export const useAutomodEventsStore = defineStore("automod-events", () => {
  const channel = useStorage("selectedChannel", undefined);

  const events = ref<AutomodEvents[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/automod-events`);

  watch(data, () => {
    events.value = data.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  return {
    events,
    queryFilter,
    startRefresh,
    stopRefresh,
  };
});
