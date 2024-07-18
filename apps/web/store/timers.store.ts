import type { Timers } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TCreateTimer, TUpdateTimer } from "~/types/timers.type";
import { usePopupsStore } from "./popups.store";
import { EPopupType } from "~/types/popup.type";

export const useTimersStore = defineStore("timers", () => {
  const channel = useStorage("selectedChannel", undefined);

  const timers = ref<Timers[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/timers`);

  watch(data, () => {
    timers.value = data.value || [];
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
      return timers.value;
    }

    return timers.value.filter((el) =>
      el.message.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  const handleDelete = async (id: number) => {
    const res = await $fetch(`/api/${channel.value}/timers`, {
      method: "DELETE",
      body: { id },
    });

    if (!res) {
      usePopupsStore().add({
        headline: "Error occured while deleteing timer",
        details: ["try again later"],
        type: EPopupType.Error,
        timeout: 5000,
      });
    }

    timers.value = timers.value.filter((el) => el.id !== res);
  };

  const handleUpdate = async (payload: TUpdateTimer) => {
    const res = await $fetch(`/api/${channel.value}/timers`, {
      method: "PUT",
      body: payload,
    });

    for (const i in timers.value) {
      if (timers.value[i].id !== res.id) {
        continue;
      }

      timers.value[i] = res;
      return;
    }
  };

  const handleCreate = async (paylod: TCreateTimer) => {
    try {
      const res = await $fetch(`/api/${channel.value}/timers`, {
        method: "POST",
        body: paylod,
      });

      timers.value.push(res);
    } catch (_) {
      usePopupsStore().add({
        headline: "Error occured while creating timer",
        details: ["try again later"],
        type: EPopupType.Error,
        timeout: 5000,
      });
    }
  };

  return {
    timers,
    filtered,
    stopRefresh,
    startRefresh,
    queryFilter,
    handleDelete,
    handleUpdate,
    handleCreate,
  };
});
