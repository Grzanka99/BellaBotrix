<script setup lang="ts">
defineProps<{
  gridTemplate: string,
}>()
</script>

<template>
  <li class="styled-table-row" :style="{ gridTemplateColumns: gridTemplate }">
    <slot />
  </li>
</template>
<style lang="scss" scoped>
.styled-table-row {
  display: grid;
  width: 100%;

    border-bottom: 1px solid var(--stroke);

  transition: background 50ms cubic-bezier(.4, 0, .2, 1);

  &:hover {
    background: var(--background-dim);
  }
}
</style>
