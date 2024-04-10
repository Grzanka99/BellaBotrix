<script setup lang="ts">
import Modal from '../ui/Modal.vue';
import FormTextarea from '../ui/FormTextarea.vue';
import FormButton from '../ui/FormButton.vue';
import { useTriggerWordsStore } from '~/store/trigger-words.store';
import { type TCreateTriggerWord, SCreateTriggerWord } from '~/types/trigger-words.type';

const emit = defineEmits<{
  (e: 'cancel'): void;
}>()

const s = useTriggerWordsStore();

const triggers = ref('');
const response = ref('');

const { errors, validate, isInvalid } = useValidation<keyof TCreateTriggerWord>()

const parsed = computed(() => {
  const payload = {
    triggers: triggers.value,
    response: response.value
  }

  return SCreateTriggerWord.safeParse(payload);
})

watch(parsed, v => {
  errors.value = [];
  if (!v.success) {
    errors.value = v.error.errors
  }
})

const onCancel = () => {
  triggers.value = '';
  response.value = '';
  errors.value = [];
  emit('cancel')
}

const handleSave = async () => {
  if (!parsed.value.success) {
    return;
  }

  await s.handleCreate({
    triggers: triggers.value,
    response: response.value
  })

  onCancel();
}
</script>

<template>
  <Modal header="New trigger words" @close="onCancel" open>
    <form @submit.prevent="handleSave" class="new-trigger-words-form">
      <FormTextarea
        name="triggers"
        label="Triggers"
        :error="validate('triggers')"
        v-model="triggers" />
      <FormTextarea
        name="response"
        label="Response"
        :error="validate('response')"
        v-model="response" />
      <div class="new-trigger-words-form__buttons">
        <FormButton type="button" @click="onCancel">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid">Add</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.new-trigger-words-form {
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
