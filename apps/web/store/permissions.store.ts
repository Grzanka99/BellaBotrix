import type { TPermissionEntry, TUpdatePermissionsDto } from "~/types/permissions.type";

export const usePermissionsStore = defineStore("permissions", () => {
  const permissions = ref<TPermissionEntry[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => "/api/admin/permissions");

  watch(data, () => {
    permissions.value = data.value || [];
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
      return permissions.value;
    }

    return permissions.value.filter((el) =>
      el.username.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  const handleUpdate = async (payload: TUpdatePermissionsDto) => {
    const res = await $fetch("/api/admin/permissions", {
      method: "PUT",
      body: payload,
    });

    for (const i in permissions.value) {
      if (permissions.value[i].id !== res.id) {
        continue;
      }

      permissions.value[i] = res;
      return;
    }
  };

  return {
    permissions,
    filtered,
    queryFilter,
    stopRefresh,
    startRefresh,
    handleUpdate,
  };
});
