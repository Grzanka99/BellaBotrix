<script setup lang="ts">
import type { SubCommands } from "@prisma/client";
import { useCommandsStore } from "~/store/commands.store";
import FormTextarea from "../ui/FormTextarea.vue";
import FormTextInput from "../ui/FormTextInput.vue";
import FormButton from "../ui/FormButton.vue";

const props = defineProps<{
  originalSubcommand: SubCommands;
}>();

const s = useCommandsStore();

const alias = ref(props.originalSubcommand.alias);
const message = ref<Record<string, string>>(
  {
    ...(props.originalSubcommand.message as Record<string, string>),
  } || {},
);

const handleSave = async () => {
  await s.handleSubcmdUpdate(props.originalSubcommand.id, {
    alias: alias.value,
    message: message.value,
  });
};

const handleReset = () => {
  alias.value = props.originalSubcommand.alias;
  message.value = props.originalSubcommand.message as Record<string, string>;
};
</script>

<template>
  <form @submit.prevent="handleSave" class="edit-subcommand-form">
    <h4>{{ originalSubcommand.name }}: Message</h4>
    <FormTextarea
      v-for="(_, key) in message"
      :label="key"
      :name="`message-${key}`"
      v-model="message[key]"
      :restore="originalSubcommand.message?.[key]" />
    <h4>{{ originalSubcommand.name }}: Alias</h4>
    <FormTextInput type="text" name="alias" v-model="alias" />
    <div class="edit-subcommand-form__buttons">
      <FormButton type="button" @click="handleReset">reset {{ originalSubcommand.name }}</FormButton>
      <FormButton type="submit">update {{ originalSubcommand.name }}</FormButton>
    </div>
  </form>
</template>
<style lang="scss" scoped>
.edit-subcommand-form {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &:not(:last-child) {
    margin-bottom: var(--padding-double);
  }

  &__buttons {
    display: flex;
    gap: var(--padding);
  }
}
</style>
