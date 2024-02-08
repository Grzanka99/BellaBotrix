import type { Commands } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TCreateCommand, TUpdateCommand } from "~/types/commands.type";

export const useCommandsStore = defineStore("commands", () => {
  const channel = useStorage("selectedChannel", undefined);

  const commands = ref<Commands[]>([]);
  const queryFileter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/commands`);

  watch(data, () => {
    commands.value = data.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const filteredCommands = computed(() => {
    if (!queryFileter.value.length) {
      return commands.value;
    }

    return commands.value.filter(
      (el) =>
        el.name.toLowerCase().includes(queryFileter.value.toLowerCase()) ||
        el.alias.toLowerCase().includes(queryFileter.value.toLowerCase()),
    );
  });

  const handleDelete = async (id: number) => {
    const res = await $fetch(`/api/${channel.value}/commands`, {
      method: "DELETE",
      body: { id },
    });

    if (!res) {
      // TODO: Toast
    }

    commands.value = commands.value.filter((el) => el.id !== res);
  };

  const handleUpdate = async (id: number, payload: Omit<TUpdateCommand, "id">) => {
    const res = await $fetch(`/api/${channel.value}/commands`, {
      method: "PUT",
      body: { ...payload, id },
    });

    for (const i in commands.value) {
      if (commands.value[i].id !== res.id) {
        continue;
      }

      commands.value[i] = res;
      return;
    }
  };

  const handleCreate = async (payload: TCreateCommand) => {
    try {
      const res = await $fetch(`/api/${channel.value}/commands`, {
        method: "POST",
        body: payload,
      });

      commands.value.push(res);
    } catch (_) {
      // TODO: Toast
    }
  };

  const checkIfTaken = async (name: string) => {
    const res = await $fetch(`/api/${channel.value}/commands?name=${name}`);

    return !!res.length;
  };

  return {
    commands,
    filteredCommands,
    queryFileter,
    startRefresh,
    stopRefresh,
    refresh,
    handleDelete,
    handleUpdate,
    handleCreate,
    checkIfTaken,
  };
});
