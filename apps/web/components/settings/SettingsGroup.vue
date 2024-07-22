<script setup lang="ts">
import type { TPerms } from '~/types/permissions.type';

const props = defineProps<{
  groupName: string;
  requiredPerms?: TPerms[],
}>();

const auth = useAuth();

const canEdit = computed(() => {
  if (!props.requiredPerms) {
    return true;
  }

  const userRoles = auth.session.value?.perms || [];

  for (const role of userRoles) {
    if (props.requiredPerms.includes(role)) {
      return true;
    }
  }

  return false;
})

</script>

<template>
  <div class="settings-group" :class="{ locked: !canEdit, }">
    <h3 class="settings-group__name">
      {{ groupName }}
      <span v-if="!canEdit">
        <i>(You can request access by reaching administrator)</i>
      </span>
    </h3>
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.settings-group {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--stroke);
  padding: var(--padding);
  border-radius: var(--radius);

  &__name {
    margin-bottom: var(--padding);
  }

  &.locked {
    pointer-events: none;
    opacity: 0.5;
    border: 1px solid var(--warn);
  }
}
</style>
