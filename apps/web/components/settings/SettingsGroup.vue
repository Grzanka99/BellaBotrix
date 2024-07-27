<script setup lang="ts">
defineProps<{
  groupName: string;
}>();
</script>

<template>
  <div class="settings-group">
    <h3 class="settings-group__name">
      {{ groupName }}
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
}
</style>
