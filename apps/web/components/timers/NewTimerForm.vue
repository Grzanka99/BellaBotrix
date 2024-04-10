<script lang="ts" setup>
import Modal from '../ui/Modal.vue';
import { useTimersStore } from '~/store/timers.store';
import { SCreateTimer, type TUpdateTimer } from '~/types/timers.type';
import FormTextarea from '../ui/FormTextarea.vue';
import FormNumberInput from '../ui/FormNumberInput.vue';
import FormButton from '../ui/FormButton.vue';

const emit = defineEmits<{
  (e: 'cancel'): void;
}>()

const timersStore = useTimersStore();

const message = ref('');
const timeout = ref(1000);

const { errors, validate, isInvalid } = useValidation<keyof TUpdateTimer>();

const parsed = computed(() => {
  const payload = {
    message: message.value,
    timeout: timeout.value
  }

  return SCreateTimer.safeParse(payload)
})

watch(parsed, (v) => {
  errors.value = [];
  if (!v.success) {
    errors.value = v.error.errors;
  }
})

const onCancel = () => {
  message.value = '';
  timeout.value = 1000;
  errors.value = [];
  emit('cancel');
}

const handleSave = async () => {
  if (!parsed.value.success) {
    return;
  }

  await timersStore.handleCreate({
    message: message.value,
    timeout: timeout.value,
  })

  onCancel()
}
</script>

<template>
  <Modal header="New timer" @close="onCancel" open>
    <form @submit.prevent="handleSave" class="edit-timer-form">
      <FormTextarea
        name="message"
        label="Message"
        :error="validate('message')"
        v-model="message" />
      <FormNumberInput
        name="timeout"
        label="Timeout (in seconds, set 0 to disable)"
        :error="validate('timeout')"
        v-model="timeout" />
      <div class="edit-timer-form__buttons">
        <FormButton type="button" @click="onCancel">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid">Add</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.edit-timer-form {
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
