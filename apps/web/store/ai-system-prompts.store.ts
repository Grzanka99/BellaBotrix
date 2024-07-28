import type { OllamaAISetupPrompts } from "@prisma/client";
import { usePopupsStore } from "./popups.store";
import { EPopupType } from "~/types/popup.type";
import type { TUpdateAISystemPromptDto } from "~/types/ai-settings.type";

export const useAISystemPromptsStore = defineStore("ai-system-prompts-store", () => {
  const prompts = ref<OllamaAISetupPrompts[]>([]);
  const queryFilter = ref("");

  const { data, refresh } = useFetch(() => "/api/admin/ai-system-prompts");

  watch(data, () => {
    prompts.value = data.value || [];
  });

  const refreshTimer = ref<NodeJS.Timeout>();

  const startRefresh = () => {
    refreshTimer.value = setInterval(refresh, 10000);
  };

  const stopRefresh = () => {
    clearInterval(refreshTimer.value);
    refreshTimer.value = undefined;
  };

  const sorted = computed(() => prompts.value.sort((a, b) => a.order - b.order));

  const handleDelete = async (id: number) => {
    const res = await $fetch("/api/admin/ai-system-prompts", {
      method: "DELETE",
      body: { id },
    });

    if (!res) {
      usePopupsStore().add({
        headline: "Error occured while deleting propmpt",
        details: ["try again later", "check your permissions"],
        type: EPopupType.Error,
        timeout: 5000,
      });
    }

    prompts.value = prompts.value.filter((el) => el.id !== res);
  };

  const handleUpdate = async (payload: TUpdateAISystemPromptDto) => {
    const res = await $fetch("/api/admin/ai-system-prompts", {
      method: "PUT",
      body: payload,
    });

    await refresh();
  };

  const handleCreate = async () => {
    try {
      const res = await $fetch("/api/admin/ai-system-prompts", {
        method: "POST",
      });

      prompts.value.push(res);
    } catch (_) {
      usePopupsStore().add({
        headline: "Error occured while creating order",
        details: ["try again later", "check your permissions"],
        type: EPopupType.Error,
        timeout: 5000,
      });
    }
  };

  return {
    prompts: sorted,
    stopRefresh,
    startRefresh,
    queryFilter,
    handleDelete,
    handleCreate,
    handleUpdate,
  };
});
