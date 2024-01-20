<script setup lang="ts">
import type { Commands } from '@prisma/client';
import FormTextarea from '../ui/FormTextarea.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import FormButton from '../ui/FormButton.vue';
import Modal from '../ui/Modal.vue';

const props = defineProps<{
  originalCommand: Commands;
}>()

defineEmits<{
  (e: 'cancel'): void;
  (e: 'save', v: any): void;
}>()

const alias = ref(props.originalCommand.alias);
const message = ref(props.originalCommand.message || {});

</script>

<template>
  <Modal :header="`Edit command: ${originalCommand.name}`" open>
    <form @submit.prevent="" class="edit-command-form">
      <h3>Message</h3>
      <FormTextarea v-for="_, key in message" :label="key" :name="`message-${key}`" v-model="message[key]"
        :restore="originalCommand.message?.[key]" />
      <h3>Alias</h3>
      <FormTextInput type="text" name="alias" v-model="alias" />
      <div class="edit-command-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit">Save</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.edit-command-form {
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
