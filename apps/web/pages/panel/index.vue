<script setup lang="ts">
import { useStorage } from "@vueuse/core";

useHead({
  title: "Dashboard",
});
</script>

<template>
  <div class="dashboard">
    <h1>Dashboard work in progres...</h1>
  </div>
</template>

<style lang="scss">
.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--padding);

  &__header {
    display: flex;
    flex-grow: 0;
    gap: var(--padding);
    height: 40px;

    &__group {
      display: flex;
      gap: var(--padding);
    }
  }
}
</style>
