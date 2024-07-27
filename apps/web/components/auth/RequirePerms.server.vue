<script lang="ts" setup>
import type { TPerms } from '~/types/permissions.type';

const props = defineProps<{
  require: TPerms[]
  type: 'hide' | 'blur' | 'block'
}>()

const auth = useAuth();

const canOpen = computed<boolean>(() => {
  if (auth.session.value?.perms.includes('admin')) {
    return true;
  }

  for (const perm of props.require) {
    if (auth.session.value?.perms.includes(perm)) {
      return true;
    }
  }

  return false;
});
</script>

<template>
  <template v-if="canOpen">
    <slot />
  </template>
  <template v-else>
    <template v-if="type === 'hide'"></template>
    <template v-else-if="type === 'blur'">
      <div class="block-wrapper blocked-blur-its-just-fancy">
        <slot />
      </div>
    </template>
    <template v-else-if="type === 'block'">
      <div class="block-wrapper blocked-block-its-just-fancy">
        <slot />
      </div>
    </template>
    <template v-else></template>
  </template>
</template>

<style lang="scss" scoped>
.block-wrapper {
  width: fit-content;
  height: fit-content;
  pointer-events: none;
  user-select: none;
}

.blocked-blur-its-just-fancy {
  filter: blur(4px);
}

.blocked-block-its-just-fancy {
  opacity: 0.5;
}
</style>
