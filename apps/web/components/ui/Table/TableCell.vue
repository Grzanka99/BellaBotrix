<script setup lang="ts">
defineProps<{
  centered?: boolean;
}>()
</script>

<template>
  <div class="styled-table-cell">
    <div class="styled-table-cell__content" :class="{ 'styled-table-cell__content--centered': centered }">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.styled-table-cell {
  border: none;
  min-width: 0;

  &:not(:last-child) {
    border-right: 1px solid var(--stroke);
  }

  &__content {
    padding: var(--padding);
    width: 100%;
    min-width: 0;
    overflow: hidden;

    &--centered {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }
  }
}
</style>
