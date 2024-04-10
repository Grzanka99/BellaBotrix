import type { TriggerWords } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TCreateTriggerWord, TUpdateTriggerWord } from "~/types/trigger-words.type";

export const useTriggerWordsStore = defineStore("trigger-words", () => {
  const channel = useStorage("selectedChannel", undefined);

  const triggerWords = ref<TriggerWords[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/trigger-words`);

  watch(data, () => {
    triggerWords.value = data.value || [];
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
      return triggerWords.value;
    }

    return triggerWords.value.filter((el) =>
      el.triggers.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  const handleDelete = async (id: number) => {
    const res = await $fetch(`/api/${channel.value}/trigger-words`, {
      method: "DELETE",
      body: { id },
    });

    if (!res) {
      // TODO: Toast
    }

    triggerWords.value = triggerWords.value.filter((el) => el.id !== res);
  };

  const handleUpdate = async (payload: TUpdateTriggerWord) => {
    const res = await $fetch(`/api/${channel.value}/trigger-words`, {
      method: "PUT",
      body: payload,
    });

    for (const i in triggerWords.value) {
      if (triggerWords.value[i].id !== res.id) {
        continue;
      }

      triggerWords.value[i] = res;
      return;
    }
  };

  const handleCreate = async (paylod: TCreateTriggerWord) => {
    try {
      const res = await $fetch(`/api/${channel.value}/trigger-words`, {
        method: "POST",
        body: paylod,
      });

      triggerWords.value.push(res);
    } catch (_) {
      // TODO: Toast
    }
  };

  return {
    triggerWords,
    filtered,
    stopRefresh,
    startRefresh,
    queryFilter,
    handleDelete,
    handleUpdate,
    handleCreate,
  };
});
