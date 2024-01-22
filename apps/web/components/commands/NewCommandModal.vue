<script setup lang="ts">
import Modal from '../ui/Modal.vue'
import FormButton from '../ui/FormButton.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import FormTextarea from '../ui/FormTextarea.vue';
import { useStorage } from '@vueuse/core'
import { SCreateCommand, type TCreateCommand } from '~/types/commands.type';
import { useCommandsStore } from '~/store/commands.store';

const emit = defineEmits<{
  (e: 'submit', payload: TCreateCommand): void,
  (e: 'cancel'): void
}>()
defineProps<{
  open: boolean;
}>()

const name = ref('');
const message = ref('');
const channelName = useStorage('selectedChannelName', undefined);

const alreadyExists = ref(false);

const parsed = computed(() => {
  const payload = {
    name: name.value,
    message: message.value,
  }

  if (!payload.name || !payload.message) {
    return {
      success: true as const,
      data: payload,
    };
  }

  return SCreateCommand.safeParse(payload)
})

const { validate, isInvalid, errors, clearField } = useValidation<keyof TCreateCommand>();

const commandsStore = useCommandsStore();

watchDebounced(name, async () => {
  clearField('name')
  alreadyExists.value = false;
  if (!name.value.length) {
    return;
  }

  const res = await commandsStore.checkIfTaken(name.value);
  if (res) {
    errors.value.push({
      code: 'custom',
      message: 'Already exists',
      path: ['name']
    })
  }
  alreadyExists.value = res;
}, { debounce: 1000, maxWait: 5000 })

watch(message, () => {
  clearField('message')

  if (!parsed.value.success) {
    errors.value = parsed.value.error.errors;
  }
})

const handleAddComand = async () => {
  if (!parsed.value.success) {
    return;
  }

  emit('submit', parsed.value.data);
  name.value = '';
  message.value = '';
  errors.value = [];
}

const handleCancel = () => {
  name.value = '';
  message.value = '';
  errors.value = [];
  emit('cancel');
}

</script>

<template>
  <Modal
    :open="open"
    @close="handleCancel"
    header="Add new command"
    :description="`Add new command for channel: #${channelName}`">
    <h4 v-if="alreadyExists">Command: {{ name }} already exists for user: {{ channelName }}</h4>
    <form
      @submit.prevent="handleAddComand"
      class="command-form">
      <FormTextInput
        name="name"
        v-model="name"
        placeholder="name"
        label="command name"
        :error="validate('name')" />
      <FormTextarea
        name="message"
        v-model="message"
        placeholder="message"
        label="command message"
        :error="validate('message')" />
      <div class="command-form__controls">
        <FormButton type="button" @click="handleCancel">Cancel</FormButton>
        <FormButton type="submit" :disabled="isInvalid || !name.length || !message.length">Add</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.command-form {
  min-width: 25vw;
  max-width: 90vw;
  width: 400px;
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__controls {
    display: flex;
    gap: var(--padding);
  }
}

h4 {
  color: var(--error);
}
</style>
