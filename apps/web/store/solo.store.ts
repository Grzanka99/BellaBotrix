import type { Solo } from "@prisma/client";
import { useStorage } from "@vueuse/core";

export const useSoloStore = defineStore("solo", () => {
  const channel = useStorage("selectedChannel", undefined);

  const solos = ref<Solo[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/solo`);

  watch(data, () => {
    solos.value = data.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const filtered = computed(() => {
    if (!queryFilter.value.length) {
      return solos.value;
    }

    return solos.value.filter(
      (el) =>
        el.user1.toLowerCase().includes(queryFilter.value.toLowerCase()) ||
        el.user2.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  return {
    solos,
    filtered,
    stopRefresh,
    startRefresh,
    queryFilter,
  };
});
