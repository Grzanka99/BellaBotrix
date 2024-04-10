<script lang="ts" setup>
import type { TriggerWords } from '@prisma/client';
import Modal from '../ui/Modal.vue';
import FormTextarea from '../ui/FormTextarea.vue';
import FormButton from '../ui/FormButton.vue';
import { useTriggerWordsStore } from '~/store/trigger-words.store';
import { SUpdateTriggerWord, type TUpdateTriggerWord } from '~/types/trigger-words.type';

const props = defineProps<{
  originalTrigger: TriggerWords
}>()

const emit = defineEmits<{
  (e: 'cancel'): void;
}>()

const s = useTriggerWordsStore();

const triggers = ref(props.originalTrigger.triggers);
const response = ref(props.originalTrigger.response);

const { errors, validate, isInvalid } = useValidation<keyof TUpdateTriggerWord>();

watch([triggers, response], () => {
  errors.value = [];
  const parsed = SUpdateTriggerWord
    .omit({ id: true, enabled: true })
    .safeParse({ triggers: triggers.value, response: response.value })
  if (parsed.success) {
    return;
  }

  errors.value = parsed.error.errors;
})

const handleSave = async () => {
  if (!isInvalid) {
    return;
  }

  await s.handleUpdate({
    id: props.originalTrigger.id,
    triggers: triggers.value,
    response: response.value,
  })

  emit('cancel')
}

</script>

<template>
  <Modal header="Edit trigger" @close="$emit('cancel')" open>
    <form @submit.prevent="handleSave" class="edit-trigger-words-form">
      <FormTextarea
        name="triggers"
        label="Triggers"
        v-model="triggers"
        :restore="originalTrigger.triggers" />
      <FormTextarea
        name="response"
        label="Response"
        v-model="response"
        :restore="originalTrigger.response" />
      <div class="edit-trigger-words-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid">Save</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.edit-trigger-words-form {
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
