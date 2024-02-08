<script lang="ts" setup>
import type { Timers } from '@prisma/client';
import Modal from '../ui/Modal.vue';
import { useTimersStore } from '~/store/timers.store';
import { SUpdateTimer, type TUpdateTimer } from '~/types/timers.type';
import FormTextarea from '../ui/FormTextarea.vue';
import FormNumberInput from '../ui/FormNumberInput.vue';
import FormButton from '../ui/FormButton.vue';

const props = defineProps<{
  originalTimer: Timers
}>()

const emit = defineEmits<{
  (e: 'cancel'): void;
}>()

const timersStore = useTimersStore();

const message = ref(props.originalTimer.message);
const timeout = ref(props.originalTimer.timeout);

const { errors, validate, isInvalid } = useValidation<keyof TUpdateTimer>();

watch(timeout, () => {
  errors.value = [];
  const parsed = SUpdateTimer.omit({ id: true }).safeParse({ timeout: timeout.value })
  if (parsed.success) {
    return;
  }

  errors.value = parsed.error.errors;
})

const handleSave = async () => {
  if (!isInvalid) {
    return;
  }

  await timersStore.handleUpdate({
    id: props.originalTimer.id,
    message: message.value,
    timeout: timeout.value,
  })

  emit('cancel')
}

</script>

<template>
  <Modal header="Edit timer" @close="$emit('cancel')" open>
    <form @submit.prevent="handleSave" class="edit-timer-form">
      <FormTextarea
        name="message"
        label="Message"
        v-model="message"
        :restore="originalTimer.message" />
      <FormNumberInput
        name="timeout"
        label="Timeout (in seconds, set 0 to disable)"
        :error="validate('timeout')"
        v-model="timeout" />
      <div class="edit-timer-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid">Save</FormButton>
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
