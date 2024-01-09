<script setup lang="ts">
defineProps<{
  type: 'submit' | 'button',
  disabled: boolean,
}>()
</script>

<template>
  <button class="form-button" :type="type" :disabled="disabled">
   <slot />
  </button>
</template>

<style lang="scss" scoped>
.form-button {
  margin: 0;
  width: 50%;
  padding: var(--padding-half);
  background: var(--text);
  border: none;
  outline: none;
  color: var(--background);
  font-weight: bold;

  cursor: pointer;
  transition: background 200ms;
  border-radius: var(--radius);

  &:hover {
    background: var(--text-darker);
  }

  &:disabled {
    opacity: 0.8;
  }
}
</style>
