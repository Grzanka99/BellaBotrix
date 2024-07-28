<script setup lang="ts">
import type { OllamaAIModels } from "@prisma/client";
import Modal from "../ui/Modal.vue";
import FormButton from "../ui/FormButton.vue";
import CustomSelect from "../ui/CustomSelect.vue";
import FormTextarea from "../ui/FormTextarea.vue";
import { useAIModelsStore } from "~/store/ai-models.store";
import type { TSelectOption } from "~/types/ui.type";

const props = defineProps<{
  originalModel: OllamaAIModels;
}>();

const emit = defineEmits<(e: "cancel") => void>();

const s = useAIModelsStore();

const name = ref(props.originalModel.name || "");
const description = ref(props.originalModel.description || "");

const options = computed<TSelectOption[]>(() => {
  return s.availableModels.map((el) => ({
    displayName: `${el.name} (${el.parameterSize})`,
    value: el.name,
  }));
});

const handleSave = async () => {
  await s.handleUpdate({
    id: props.originalModel.id,
    name: name.value,
    description: description.value,
  });

  emit("cancel");
};
</script>

<template>
  <Modal header="Edit model entry" @close="$emit('cancel')" open>
    <form @submit.prevent="handleSave" class="edit-model-form">
      <div class="edit-model-form__inputs">
        <CustomSelect
          :options="options"
          v-model="name" />
        <FormTextarea
          name="description"
          label="Description"
          v-model="description" />
      </div>
      <div class="edit-model-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit">Save</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.edit-model-form {
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
