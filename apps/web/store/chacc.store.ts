import type { ChannelAccess } from "@prisma/client";
import type { EChannelAccessLevel } from "bellatrix";

export const useChaccStore = defineStore("chacc", () => {
  const chacc = ref<(ChannelAccess & { username: string })[]>([]);

  const { data, refresh } = useFetch(() => "/api/channelaccess");

  watch(data, () => {
    chacc.value = data.value || [];
  });

  const handleCreate = async (username: string, accessLevel: EChannelAccessLevel) => {
    const res = await $fetch("/api/channelaccess", {
      method: "POST",
      body: {
        username,
        accessLevel,
      },
    });

    chacc.value.push(res);
    refresh();
  };

  const handleDelete = async (id: number) => {
    const res = await $fetch("/api/channelaccess", {
      method: "DELETE",
      body: { id },
    });

    if (res.revoke) {
      refresh();
    } else {
      // TODO: toast
    }
  };

  return {
    chacc,
    handleCreate,
    handleDelete,
  };
});
