import type { User } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TUpdateChatter } from "~/types/chatters.type";
import type { TSelectOption } from "~/types/ui.type";

enum ESortOptions {
  POINTSDESC = 0,
  POINTASC = 1,
  SENTDESC = 2,
  SENTASC = 3,
  NONE = 4,
}

const sortOptions: TSelectOption[] = [
  { value: ESortOptions.NONE, displayName: "do not sort (default)" },
  { value: ESortOptions.POINTSDESC, displayName: "sort by points desc." },
  { value: ESortOptions.POINTASC, displayName: "sort by points asc." },
  { value: ESortOptions.SENTDESC, displayName: "sort by sent desc." },
  { value: ESortOptions.SENTASC, displayName: "sort by sent asc." },
];

export const useChattersStore = defineStore("chatters", () => {
  const channel = useStorage("selectedChannel", undefined);

  const chatters = ref<User[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/users`);

  watch(data, () => {
    chatters.value = data.value || [];
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
      return chatters.value;
    }

    return chatters.value.filter((el) =>
      el.username.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  const sortedOption = ref<ESortOptions>(ESortOptions.NONE);

  const sorted = computed(() => {
    switch (sortedOption.value) {
      case ESortOptions.NONE:
        return filtered.value.sort((a, b) => b.id - a.id);
      case ESortOptions.SENTASC:
        return filtered.value.sort((a, b) => a.sentMessages - b.sentMessages);
      case ESortOptions.SENTDESC:
        return filtered.value.sort((a, b) => b.sentMessages - a.sentMessages);
      case ESortOptions.POINTASC:
        return filtered.value.sort((a, b) => a.points - b.points);
      case ESortOptions.POINTSDESC:
        return filtered.value.sort((a, b) => b.points - a.points);
      default:
        return filtered.value.sort((a, b) => b.id - a.id);
    }
  });

  const handleUpdate = async (payload: TUpdateChatter) => {
    const res = await $fetch(`/api/${channel.value}/users`, {
      method: "PUT",
      body: payload,
    });

    for (const i in chatters.value) {
      if (chatters.value[i].id !== res.id) {
        continue;
      }

      chatters.value[i] = res;
      return;
    }
  };

  return {
    chatters,
    filtered,
    queryFilter,
    startRefresh,
    stopRefresh,
    handleUpdate,
    sortOptions,
    sortedOption,
    sorted,
  };
});
