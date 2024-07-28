<script lang="ts" setup>
import type { OllamaAISetupPrompts } from '@prisma/client';
import Modal from '../ui/Modal.vue';
import FormTextarea from '../ui/FormTextarea.vue';
import FormButton from '../ui/FormButton.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import { useAISystemPromptsStore } from '~/store/ai-system-prompts.store';

const props = defineProps<{
  originalPrompt: OllamaAISetupPrompts
}>()

const emit = defineEmits<{
  (e: 'cancel'): void;
}>()

const s = useAISystemPromptsStore();

const name = ref(props.originalPrompt.name || "");
const text = ref(props.originalPrompt.text);

const handleSave = async () => {
  await s.handleUpdate({
    id: props.originalPrompt.id,
    name: name.value,
    text: text.value,
  })

  emit('cancel')
}

</script>

<template>
  <Modal header="Edit system prompt" @close="$emit('cancel')" open>
    <form @submit.prevent="handleSave" class="edit-system-prompt-form">
      <FormTextInput
        name="name"
        label="Name"
        v-model="name"
        :restore="originalPrompt.name" />
      <FormTextarea
        name="text"
        label="Text"
        v-model="text" />
      <div class="edit-system-prompt-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit">Save</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.edit-system-prompt-form {
  min-width: 25vw;
  max-width: 90vw;
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__buttons {
    display: flex;
    gap: var(--padding);
  }
}
</style>
