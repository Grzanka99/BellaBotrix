import type { TCreateR6DleOperator, TR6dleOperatorV2, TUpdateR6dleOperator } from "r6dle";

export const useR6DleOperatorsStore = defineStore("r6dleOperators", () => {
  const userPerms = useAuth().session.value?.perms;

  const operators = ref<TR6dleOperatorV2[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => "/api/r6dle/operators");

  watch(data, () => {
    operators.value = data.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const filteredOperators = computed(() => {
    if (!queryFilter.value.length) {
      return operators.value;
    }

    return operators.value.filter((el) =>
      el.name.toLowerCase().includes(queryFilter.value.toLowerCase()),
    );
  });

  const hasAccess = computed(() => userPerms?.includes("r6dleadmin"));

  const handleCreate = async (payload: TCreateR6DleOperator) => {
    try {
      const res = await $fetch("/api/r6dle/operators", {
        method: "POST",
        body: payload,
      });

      operators.value.push(res);
    } catch (_) {
      // TODO: Toast
    }
  };

  const handleUpdate = async (payload: TUpdateR6dleOperator) => {
    const res = await $fetch("/api/r6dle/operators", {
      method: "PUT",
      body: payload,
    });

    for (const i in operators.value) {
      if (operators.value[i].id !== res.id) {
        continue;
      }

      operators.value[i] = res;
      return;
    }
  };

  const handleDelete = async (id: number) => {
    const res = await $fetch("/api/r6dle/operators", {
      method: "DELETE",
      body: { id },
    });

    if (!res) {
      // TODO: Toast
    }

    operators.value = operators.value.filter((el) => el.id !== res);
  };

  return {
    operators,
    filteredOperators,
    startRefresh,
    stopRefresh,
    handleCreate,
    handleUpdate,
    handleDelete,
    hasAccess,
    queryFilter,
  };
});
