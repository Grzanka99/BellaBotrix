<script setup lang="ts">
import { useAIModelsStore } from "~/store/ai-models.store";
import type { TSelectOption } from "~/types/ui.type";
import CustomSelect from "../ui/CustomSelect.vue";
import FormButton from "../ui/FormButton.vue";
import FormTextarea from "../ui/FormTextarea.vue";
import Modal from "../ui/Modal.vue";

defineProps<{
  open: boolean;
}>();

const emit = defineEmits<(e: "cancel") => void>();

const s = useAIModelsStore();

const description = ref("");

const options = computed<TSelectOption<string>[]>(() => {
  return [
    {
      displayName: "Gemini 2.0 Flash",
      value: "gemini-2.0-flash",
    },
    ...s.availableModels.map((el) => ({
      displayName: `${el.name} (${el.parameterSize})`,
      value: el.name,
    })),
  ];
});

const providers = [
  {
    displayName: "Google Gemini",
    value: "gemini",
  },
  {
    displayName: "Ollama",
    value: "ollama",
  },
];

const name = ref(options.value?.[0]?.value || "");
const provider = ref(providers[0].value || "");

const handleAdd = async () => {
  await s.handleCreate({
    name: name.value,
    description: description.value,
    provider: provider.value,
  });

  name.value = "";
  description.value = "";

  emit("cancel");
};
</script>

<template>
  <Modal header="New model entry" @close="$emit('cancel')" :open="open">
    <form @submit.prevent="handleAdd" class="new-model-form">
      <div class="new-model-form__inputs">
        <CustomSelect
          :options="options"
          v-model="name" />
        <FormTextarea
          name="description"
          label="Description"
          v-model="description" />
        <CustomSelect :options="providers" v-model="provider" />
      </div>
      <div class="new-model-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit">Add</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.new-model-form {
  min-width: 25vw;
  max-width: 90vw;
  height: 400px;
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: var(--padding);
  justify-content: space-between;

  &__inputs {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: var(--padding);
  }

  &__buttons {
    display: flex;
    gap: var(--padding);
  }
}
</style>
