import { User } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TUpdateChatter } from "~/types/chatters.type";

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

    return chatters.value.filter((el) => el.username.includes(queryFilter.value));
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
  };
});
