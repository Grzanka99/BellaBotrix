<script setup lang="ts">
import type { Commands } from "@prisma/client";
import FormTextarea from "../ui/FormTextarea.vue";
import FormTextInput from "../ui/FormTextInput.vue";
import FormButton from "../ui/FormButton.vue";
import Modal from "../ui/Modal.vue";
import { useCommandsStore } from "~/store/commands.store";
import type { TCommandWithSubCommands } from "~/types/commands.type";
import EditSubcommand from "./EditSubcommand.vue";

const props = defineProps<{
  originalCommand: TCommandWithSubCommands;
}>();

const emit = defineEmits<{
  (e: "cancel"): void;
}>();

const s = useCommandsStore();

const alias = ref(props.originalCommand.alias);
const message = ref<Record<string, string>>(
  {
    ...(props.originalCommand.message as Record<string, string>),
  } || {},
);

const handleSave = async () => {
  await s.handleUpdate(props.originalCommand.id, {
    alias: alias.value,
    message: message.value,
  });

  emit("cancel");
};
</script>

<template>
  <Modal
    :header="`Edit command: ${originalCommand.name}`"
    @close="$emit('cancel')"
    open>
    <form @submit.prevent="handleSave" class="edit-command-form">
      <h3>Message</h3>
      <FormTextarea
        v-for="(_, key) in message"
        :label="key"
        :name="`message-${key}`"
        v-model="message[key]"
        :restore="originalCommand.message?.[key]" />
      <h3>Alias</h3>
      <FormTextInput type="text" name="alias" v-model="alias" />
      <div class="edit-command-form__buttons">
        <FormButton type="button" @click="$emit('cancel')">Cancel</FormButton>
        <FormButton type="submit">Save</FormButton>
      </div>
    </form>
    <template v-if="originalCommand.subCommands.length">
      <h2>Subcommands</h2>
      <EditSubcommand
        v-for="sub in originalCommand.subCommands"
        :original-subcommand="sub" />
    </template>
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
