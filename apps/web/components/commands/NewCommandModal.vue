<script setup lang="ts">
import Modal from '../ui/Modal.vue'
import FormButton from '../ui/FormButton.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import FormTextarea from '../ui/FormTextarea.vue';
import { useStorage } from '@vueuse/core'
import { SCreateCommand, type TCreateCommand } from '~/types/commands.type';

const emit = defineEmits(["success"])
defineProps<{
  open: boolean;
}>()

const name = ref('');
const message = ref('');
const channel = useStorage('selectedChannel', undefined);
const channelName = useStorage('selectedChannelName', undefined);

const alreadyExists = ref(false);

const parsed = computed(() => SCreateCommand.safeParse({
  name: name.value,
  message: message.value,
}))

const { validate, isInvalid, errors } = useValidation<keyof TCreateCommand>();

watchEffect(() => {
  errors.value = [];
  alreadyExists.value = false;

  if (!parsed.value.success) {
    errors.value = parsed.value.error.errors;
  }
})


const handleAddComand = async () => {
  if (!parsed.value.success) {
    return;
  }

  const { error } = await useFetch(`/api/${channel.value}/commands`, {
    method: 'POST',
    body: parsed.value.data
  })

  if (error.value) {
    if (error.value.statusCode === 403) {
      alreadyExists.value = true;
    }

    return;
  }


  name.value = '';
  message.value = '';

  emit('success');
}
</script>

<template>
  <Modal :open="open" header="Add new command" :description="`Add new command for channel: #${channelName}`">
    <h4 v-if="alreadyExists">Command: {{ name }} already exists for user: {{ channelName }}</h4>
    <form @submit.prevent="handleAddComand" class="command-form">
      <FormTextInput name="name" v-model="name" placeholder="name" label="command name" :error="validate('name')" />
      <FormTextarea name="message" v-model="message" placeholder="message" label="command message"
        :error="validate('message')" />
      <FormButton type="submit" width="150px" :disabled="isInvalid || !name.length || !message.length">Add</FormButton>
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

  &>button {
    align-self: flex-end;
  }
}

h4 {
  color: var(--error);
}
</style>
