<script setup lang="ts">
defineProps<{
  text: string;
}>()
</script>

<template>
  <div class="spacer-with-title">
    {{ text }}
  </div>
</template>

<style>
.spacer-with-title {
  padding: var(--padding) var(--padding-half);
  padding-bottom: var(--padding-quarter);
  margin-bottom: var(--padding-quarter);
  border-bottom: 1px solid var(--stroke);
}
</style>
