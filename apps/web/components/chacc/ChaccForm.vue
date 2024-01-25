<script setup lang="ts">
import Modal from '../ui/Modal.vue';
import FormButton from '../ui/FormButton.vue';
import FormTextInput from '../ui/FormTextInput.vue';
import CustomSelect from '../ui/CustomSelect.vue';
import { useChaccStore } from '~/store/chacc.store';
import { EChannelAccessLevel } from 'bellatrix';
import type { TSelectOption } from '~/types/ui.type';

const chacc = useChaccStore();

const emit = defineEmits<{
  (e: 'cancel'): void
}>()

const username = ref("");
const channelAccess = ref(EChannelAccessLevel.Mod);

const createChacc = () => {
  chacc.handleCreate(username.value, channelAccess.value).then(() => {
    emit('cancel')
  })
}

const options: TSelectOption[] = [
  {
    value: EChannelAccessLevel.Mod,
    displayName: EChannelAccessLevel.Mod
  },

  {
    value: EChannelAccessLevel.Owner,
    displayName: EChannelAccessLevel.Owner
  },
  {
    value: EChannelAccessLevel.Editor,
    displayName: EChannelAccessLevel.Editor
  },
  {
    value: EChannelAccessLevel.Viewer,
    displayName: EChannelAccessLevel.Viewer
  },
]

</script>

<template>
  <Modal open @close="$emit('cancel')" header="Give access to channel">
    <form @submit.prevent="createChacc" class="chacc-form">
      <FormTextInput
        name="username"
        v-model="username"
        placeholder="username"
        label="username" />
      <CustomSelect
        v-model="channelAccess"
        class="chacc-lvl-select"
        :options="options" />
      <div class="chacc-form__controls">
        <FormButton type="button" @click="$emit('cancel')">cancel</FormButton>
        <FormButton type="submit">grant access</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.chacc-form {
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
