import type { OllamaAIModels } from "@prisma/client";
import type {
  TAvailableModel,
  TCreateAIModelDto,
  TUpdateAIModelDto,
} from "~/types/ai-settings.type";

export const useAIModelsStore = defineStore("ai-models-store", () => {
  const availableModels = ref<TAvailableModel[]>([]);
  const models = ref<OllamaAIModels[]>([]);

  const { data: d1, refresh: r1, status: s1 } = useFetch(() => "/api/admin/ai-models/models");
  const { data: d2, refresh: r2, status: s2 } = useFetch(() => "/api/admin/ai-models");

  watch(d1, () => {
    availableModels.value = d1.value || [];
  });

  watch(d2, () => {
    models.value = d2.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(() => {
      if (s1.value === "success") {
        r1();
      }
      if (s2.value === "success") {
        r2();
      }
    }, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const handleDelete = async (id: number) => {
    const res = await $fetch("/api/admin/ai-models", {
      method: "DELETE",
      body: { id },
    });

    models.value = models.value.filter((el) => el.id !== res);
  };

  const handleUpdate = async (payload: TUpdateAIModelDto) => {
    const res = await $fetch("/api/admin/ai-models", {
      method: "PUT",
      body: payload,
    });

    for (const i in models.value) {
      if (models.value[i].id !== res.id) {
        continue;
      }

      models.value[i] = res;
      return;
    }
  };

  const handleCreate = async (payload: TCreateAIModelDto) => {
    const res = await $fetch("/api/admin/ai-models", {
      method: "POST",
      body: payload,
    });

    models.value.push(res);
  };

  const enabled = computed(() => {
    const res = models.value.filter((el) => {
      return el.enabled;
    });

    if (!res) {
      return [];
    }

    return res;
  });

  return {
    models,
    availableModels,
    startRefresh,
    stopRefresh,
    handleDelete,
    handleUpdate,
    handleCreate,
    enabled,
  };
});
