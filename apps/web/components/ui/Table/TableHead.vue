<script setup lang="ts">
defineProps<{
  gridTemplate: string,
}>()
</script>


<template>
  <ul class="styled-table-head">
    <li :style="{ gridTemplateColumns: gridTemplate }">
      <slot />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.styled-table-head {
  position: absolute;
    background: var(--background);
  border-bottom: 2px solid var(--stroke);
  top: 0;
  left: 0;
  width: 100%;

  >li {
    display: grid;
    width: 100%;
  }
}
</style>
