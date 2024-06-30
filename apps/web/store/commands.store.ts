import { type SubCommands, type Commands } from "@prisma/client";
import { useStorage } from "@vueuse/core";
import type { TCreateCommand, TUpdateCommand, TUpdateSubCommand } from "~/types/commands.type";

export const useCommandsStore = defineStore("commands", () => {
  const channel = useStorage("selectedChannel", undefined);

  const rawCommands = ref<Commands[]>([]);
  const subCommands = ref<SubCommands[]>([]);
  const queryFileter = ref("");

  const { data, refresh } = useFetch(() => `/api/${channel.value}/commands`);
  const { data: subData, refresh: subRefresh } = useFetch(
    () => `/api/${channel.value}/commands/subcommands`,
  );

  watch(data, () => {
    rawCommands.value = data.value || [];
  });

  watch(subData, () => {
    subCommands.value = subData.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();
  const subRefreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
    subRefreshTimer.value = setInterval(subRefresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    clearInterval(subRefreshTimer.value);

    refreshTimer.value = undefined;
    subRefreshTimer.value = undefined;
  };

  const commands = computed(() => {
    const withSubcmds = [];
    for (const cmd of rawCommands.value) {
      const sub = subCommands.value.filter((el) => el.parentCommand === cmd.uniqueName);

      withSubcmds.push({
        ...cmd,
        subCommands: sub,
      });
    }

    return withSubcmds;
  });

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

    rawCommands.value = commands.value.filter((el) => el.id !== res);
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

      rawCommands.value[i] = res;
      return;
    }
  };

  const handleSubcmdUpdate = async (id: number, payload: Omit<TUpdateSubCommand, "id">) => {
    const res = await $fetch(`/api/${channel.value}/commands/subcommands`, {
      method: "PUT",
      body: { ...payload, id },
    });

    for (const i in subCommands.value) {
      if (subCommands.value[i].id !== res.id) {
        continue;
      }

      subCommands.value[i] = res;
      return;
    }
  };

  const handleCreate = async (payload: TCreateCommand) => {
    try {
      const res = await $fetch(`/api/${channel.value}/commands`, {
        method: "POST",
        body: payload,
      });

      rawCommands.value.push(res);
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
    handleSubcmdUpdate,
  };
});
