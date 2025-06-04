<script setup lang="ts">
import type { TPermissionEntry, TPerms, TUpdatePermissionsDto } from '~/types/permissions.type';
import Modal from '../ui/Modal.vue';
import FormButton from '../ui/FormButton.vue';
import FancyMultipleToggle from '../ui/FancyMultipleToggle.vue';
import type { TSelectOption } from '~/types/ui.type';

const props = defineProps<{
  originalPerms: TPermissionEntry;
}>()

const emit = defineEmits<{
  (e: 'submit', payload: TUpdatePermissionsDto): void,
  (e: 'cancel'): void,
}>()

const perms = ref<TPerms[]>([...props.originalPerms.perms])

const handleCancel = () => {
  perms.value = [];
  emit('cancel')
}

const handleEditPermissions = async () => {
  emit('submit', {
    perms: perms.value,
    id: props.originalPerms.id
  });
  handleCancel();
}

const permissionsOptions: TSelectOption<TPerms>[] = [
  { value: 'user', displayName: 'User' },
  { value: 'admin', displayName: 'Admin' },
  { value: 'r6dleadmin', displayName: 'R6Dle Admin' },
  { value: 'moderator', displayName: 'Moderator' },
  { value: 'ai', displayName: 'AI Access' },
  { value: 'ai+', displayName: 'AI Access with privileges' },
  { value: 'automod', displayName: 'Automod' },
]

</script>

<template>
  <Modal
    :open="!!originalPerms"
    @close="handleCancel"
    :header="`Edit permissions of user: ${originalPerms.username}`"
    :description="perms.join(', ')">
    <form @submit.prevent="handleEditPermissions" class="pormissions-form">
      <FancyMultipleToggle v-model="perms" :options="permissionsOptions" />
      <div class="permissions-form__controls">
        <FormButton type="button" @click="handleCancel">Cancel</FormButton>
        <FormButton type="submit">Save</FormButton>
      </div>
    </form>
  </Modal>
</template>

<style lang="scss" scoped>
.permissions-form {
  min-width: 25vw;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__controls {
    display: flex;
    gap: var(--padding);
  }
}

.fancy-multiple-toggle {
  margin-bottom: var(--padding-double);
}
</style>
